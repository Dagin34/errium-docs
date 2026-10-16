---
title: Writing a custom classifier
description: Teach Errium about your own exception types.
group: Concepts
order: 4
---

<script>
	import Callout from '$lib/components/Callout.svelte';
	import Tabs from '$lib/components/Tabs.svelte';
	import TabPanel from '$lib/components/TabPanel.svelte';
</script>

Suppose your codebase raises a domain exception for exhausted quota, and you
want it to come back as a clean 409 rather than an opaque 500.

## The short way: `register`

For the common case — "this exception type means this status" — you do not need
a class:

```python:errors.py
import errium


class QuotaExceeded(Exception): ...


errium.register(
    QuotaExceeded,
    status=409,
    message="Your plan's quota for this resource is already in use.",
)
```

It also works as a class decorator, where the exception type is the decorated
class:

```python
@errium.register(status=429, category="RATE_LIMITED")
class SlowDown(Exception): ...
```

| Argument | Meaning |
|---|---|
| `status` | Required. The HTTP status of the response. |
| `category` | The `code` value. Defaults to the [standard category](/docs/categories) for the status. |
| `message` | A string, or a callable taking the exception. Defaults to the exception's text. |
| `priority` | Defaults to 300, above every built-in classifier. |

It matches subclasses too, and the registration applies to **every adapter** in
the process at once. Registered 5xx classifiers are still sanitized in
production like any other 5xx.

## The long way: write a classifier

A classifier needs a `priority` property and a `classify` method. There is no
base class — `ExceptionClassifier` is a `Protocol`.

```python:classifiers.py
from errium_core.contracts.categories import ErrorCategory
from errium_core.contracts.classified_error import ClassifiedError

from myapp.exceptions import QuotaExceeded


class QuotaExceededClassifier:
    @property
    def priority(self) -> int:
        # Above the core defaults (150/140), below the adapter's own (200+).
        return 160

    def classify(self, exc: Exception) -> ClassifiedError | None:
        if not isinstance(exc, QuotaExceeded):
            return None

        return ClassifiedError(
            category=ErrorCategory.CONFLICT,
            status_code=409,
            message="Your plan's quota for this resource is already in use.",
        )
```

Returning `None` for anything you don't handle is the contract — it tells the
engine to try the next classifier. Never raise from inside `classify`.

## Register it

Pass classifiers to your adapter. They are added to its default engine.

<Tabs group="framework" tabs={['FastAPI', 'Flask', 'Django Ninja', 'DRF']}>
<TabPanel value="FastAPI" index={0}>

```python
errium.install(app, classifiers=[QuotaExceededClassifier()])

# or, with the middleware directly:
app.add_middleware(ErriumMiddleware, classifiers=[QuotaExceededClassifier()])
```

</TabPanel>
<TabPanel value="Flask" index={1}>

```python
ErriumFlask(app, classifiers=[QuotaExceededClassifier()])
```

</TabPanel>
<TabPanel value="Django Ninja" index={2}>

```python
register_errium(api, classifiers=[QuotaExceededClassifier()])
```

</TabPanel>
<TabPanel value="DRF" index={3}>

```python:settings.py
REST_FRAMEWORK = {
    "EXCEPTION_HANDLER": "errium_drf.errium_exception_handler",
}

# Dotted paths; a class is instantiated with no arguments.
ERRIUM = {
    "CLASSIFIERS": ["myapp.classifiers.QuotaExceededClassifier"],
}
```

Or build a handler bound to its own engine and point the setting at it:

```python
from errium_drf import make_exception_handler

errium_exception_handler = make_exception_handler(
    classifiers=[QuotaExceededClassifier()]
)
```

</TabPanel>
</Tabs>

Each adapter also accepts `engine=` to replace the default
`ClassificationEngine` outright, and exposes `build_engine()` for the default
one. With `engine=` you are responsible for registering the adapter's own
classifiers. The Django helpers read `ERRIUM["CLASSIFIERS"]` from settings too.

<Callout variant="note">

On FastAPI, the middleware, the `HTTPException` handler and the validation
handler share **one** engine, so a classifier passed to `install()` (or to
`ErriumMiddleware`) applies to all three. Before 0.2.0 each entry point built its
own engine and a classifier had to be registered on each one.

</Callout>

## Choosing a priority

Higher priorities are evaluated first. Pick a number based on what your
classifier should beat:

| Range | Effect |
|---|---|
| 211+ | Wins over everything, including adapter validation handling |
| 201–210 | Beats the adapter's HTTP types (200) and the Django classifier |
| 191–199 | Beats the Django classifier, loses to the adapter's HTTP types |
| 151–189 | Beats the core defaults, loses to the Django and adapter classifiers |
| 101–139 | Loses to both core defaults |
| Unset | Defaults to 100 |

`errium.register(...)` uses 300, so it wins over everything — the right default
when you are saying "this exact type means this". For a classifier that should
only fill gaps, choose a number in the 151–189 band: your domain exceptions
take precedence over generic core matching while the framework's own
`HTTPException` handling stays intact.

If two classifiers share a priority, ordering between them is the order they
were registered — so prefer distinct numbers when it matters.
