---
title: Flask
description: One catch-all handler, plus the app factory pattern.
group: Frameworks
order: 2
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

```bash
pip install "errium[flask]"
```

## Integration

```python:app.py
from flask import Flask
from errium_flask import ErriumFlask

app = Flask(__name__)
ErriumFlask(app)
```

That single call is the whole integration. It registers one error handler
against the base `Exception` class:

```python
app.register_error_handler(Exception, self._handle_exception)
```

Registering on `Exception` is sufficient because Flask dispatches both raised
`HTTPException`s — from `flask.abort()`, say — and unhandled generic exceptions
to it when no more specific handler exists.

The extension also takes `classifiers=[...]` (added to the default engine) and
`engine=` (replaces it) — see
[custom classifiers](/docs/custom-classifiers). It adds a `before_request` hook
that assigns the request's trace id, available as `flask.g.errium_trace_id`.

## App factory pattern

If you build your app with a factory, construct the extension first and attach
it later:

```python:extensions.py
from errium_flask import ErriumFlask

errium = ErriumFlask()
```

```python:app.py
from flask import Flask
from .extensions import errium

def create_app():
    app = Flask(__name__)
    errium.init_app(app)
    return app
```

## What gets caught

`errium_flask` ships `WerkzeugHTTPExceptionClassifier` at priority 200, which
matches any Werkzeug `HTTPException`, maps `exc.code` through the shared
[status-code table](/docs/categories), and uses `exc.description` as the
message. An exception with no code falls back to 500.

Protocol headers on the exception are kept: Werkzeug's
`TooManyRequests(retry_after=30)` produces `Retry-After: 30`, and a 405 carries
`Allow`. Every error response also has an `X-Trace-Id` header.

Uncaught exceptions of any other type reach `GenericExceptionClassifier` and
return `INTERNAL_SERVER_ERROR`.

## Validation errors

Flask has no request-validation exception type of its own, so there is nothing
equivalent to FastAPI's `RequestValidationError` to hook. Instead, the handler
checks whether the caught exception is a pydantic `ValidationError` and, if it
is, runs it through `ValidationNormalizer` to produce the same flat `details`
map the other adapters emit.

<Callout variant="tip">

This means validation beautification works whenever you validate explicitly
inside a view — for example
`UserCreate.model_validate(request.get_json())`. Raise the pydantic error and
Errium formats it like any other.

</Callout>
