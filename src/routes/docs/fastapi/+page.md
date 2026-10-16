---
title: FastAPI
description: One install() call, and why FastAPI needs three entry points.
group: Frameworks
order: 1
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

FastAPI support ships in the base install — there is no extra to add.

```bash
pip install errium
```

## Integration

```python:main.py
from fastapi import FastAPI
import errium

app = FastAPI()

errium.install(app)
```

`install(app)` adds the middleware and registers the exception handlers
described below, all sharing one classification engine. It is idempotent —
calling it twice on the same app is a no-op.

| Argument | Meaning |
|---|---|
| `debug` | Overrides `ERRIUM_DEBUG` for the whole process (the setting is global). Leave it unset to follow the environment. |
| `classifiers` | Extra classifiers, added to the default engine. |
| `engine` | A `ClassificationEngine` that replaces the default one. |

## What it wires up

FastAPI needs three entry points, because Starlette resolves different kinds of
error in different places.

**`ErriumMiddleware`** is a Starlette `BaseHTTPMiddleware` that wraps
`call_next` in a `try`/`except`, so it catches anything escaping normal request
handling: uncaught exceptions.

**`http_exception_handler`** is registered against Starlette's `HTTPException`.
Starlette's own `ExceptionMiddleware` sits *inside* your middleware and turns an
`HTTPException` — including the router's 404 and 405 — into a response before
`ErriumMiddleware` can see it. Without this handler those responses come back as
raw `{"detail": ...}`, and `HTTPException(500, "secret")` leaks its text.

**`validation_exception_handler`** is registered against
`RequestValidationError`, which FastAPI also resolves through its handler
mechanism rather than through middleware. It additionally runs
`ValidationNormalizer`, which turns Pydantic's nested `loc`/`type`/`msg` output
into the flat `details` map.

<Callout variant="warning">

Upgrading from the two-line setup (`add_middleware(ErriumMiddleware)` plus
`validation_exception_handler`)? It still works, but it never registered the
`HTTPException` handler, so `HTTPException`, unknown routes and 405s were not
normalized. Replace it with `errium.install(app)`, or register
`errium.handlers.http_handler.http_exception_handler` for
`starlette.exceptions.HTTPException` as well.

</Callout>

## Mounted sub-apps

A mounted app does not inherit its parent's middleware or exception handlers.
Install Errium on each one:

```python
v1 = FastAPI()
errium.install(v1)

app = FastAPI()
errium.install(app)
app.mount("/v1", v1)
```

## What gets caught

| Classifier | Priority | Handles |
|---|---|---|
| `FastAPIValidationErrorClassifier` | 210 | `RequestValidationError` |
| `FastAPIHTTPExceptionClassifier` | 200 | FastAPI and Starlette `HTTPException` |

`HTTPException` maps its status code to a category through the shared
[status-code table](/docs/categories). A string `detail` becomes the response
`message`. A structured `detail` — a dict or a list — keeps `message` as the
HTTP phrase ("Bad Request") and is exposed in `details`: dict entries as
`{key: str(value)}`, list items as `{"0": ..., "1": ...}`.

Headers set on the exception (`Retry-After`, `WWW-Authenticate`, `X-*`) are
copied onto the response. A malformed JSON body is `400 BAD_REQUEST`; a body
that parses but breaks your schema is `422 VALIDATION_ERROR`.

Anything unrecognised falls through to `GenericExceptionClassifier` and returns
`INTERNAL_SERVER_ERROR` with a 500.

## CORS: add it after Errium

Starlette wraps middleware in reverse order of registration: the one added
**last** is outermost. Add `CORSMiddleware` *after* Errium so it wraps it.

```python
errium.install(app)
app.add_middleware(CORSMiddleware, allow_origins=["https://app.example.com"])
```

Add it before, and an uncaught-exception 500 is built *outside* CORS: the
response has no `Access-Control-Allow-Origin` and the browser reports a CORS
failure instead of showing your JSON body.

## Caveats

Errium depends on `fastapi`, not `fastapi[standard]`, so installing it does not
give you a server. Install `uvicorn` yourself if you need one.

A streaming response that fails after its first chunk cannot be normalized —
the status and headers are already sent. See the
[known limitations](/roadmap).
