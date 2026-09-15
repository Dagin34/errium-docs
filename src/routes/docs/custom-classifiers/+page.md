---
title: Writing a custom classifier
description: Teach Errium about your own exception types.
group: Concepts
order: 4
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

Suppose your codebase raises a domain exception for exhausted quota, and you
want it to come back as a clean 409 rather than an opaque 500.

## Write it

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
            category=ErrorCategory.DUPLICATE,
            status_code=409,
            message="Your plan's quota for this resource is already in use.",
        )
```

Returning `None` for anything you don't handle is the contract — it tells the
engine to try the next classifier. Never raise from inside `classify`.

## Register it

```python
engine = ClassificationEngine()
engine.register(QuotaExceededClassifier())
```

<Callout variant="warning">

**Each entry point builds its own `ClassificationEngine`.** A classifier meant
to apply everywhere must be registered on every entry point.

That means the FastAPI middleware and the FastAPI validation handler each hold
a separate engine — registering on one does not affect the other. The Flask
extension builds its own per instance. The Ninja registration function builds
one per `register_errium(api)` call. The DRF adapter builds one at module
import, as a module-level `_engine`.

This is the single easiest thing to get wrong: a classifier that works for
uncaught exceptions but mysteriously doesn't apply to validation errors is
almost always one registered on a single entry point.

</Callout>

## Choosing a priority

Higher priorities are evaluated first. Pick a number based on what your
classifier should beat:

| Range | Effect |
|---|---|
| 211+ | Wins over everything, including adapter validation handling |
| 151–209 | Beats the core defaults, loses to the adapter's framework types |
| 101–139 | Loses to both core defaults |
| Unset | Defaults to 100 |

The useful default is somewhere in the 151–209 band: your domain exceptions
take precedence over generic core matching, while the framework's own
`HTTPException` handling stays intact.

If two classifiers share a priority, ordering between them is the order they
were registered — so prefer distinct numbers when it matters.
