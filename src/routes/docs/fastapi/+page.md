---
title: FastAPI
description: Two entry points, and why FastAPI needs both.
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
from fastapi.exceptions import RequestValidationError
from errium import ErriumMiddleware
from errium.handlers.validation_handler import validation_exception_handler

app = FastAPI()

# 1. Add middleware to catch raw & HTTP exceptions
app.add_middleware(ErriumMiddleware)

# 2. Add validation exception handler to capture validation errors
app.add_exception_handler(RequestValidationError, validation_exception_handler)
```

## Why two lines

Every other adapter needs one integration point. FastAPI needs two, and the
reason is structural rather than an oversight.

`ErriumMiddleware` is a Starlette `BaseHTTPMiddleware` that wraps `call_next`
in a `try`/`except`, so it catches anything escaping normal request handling.
That covers uncaught exceptions and `HTTPException`.

It does not cover `RequestValidationError`. Starlette resolves that through
FastAPI's exception-handler mechanism, not through middleware exception
propagation — by the time middleware would see it, FastAPI has already handled
it. So `validation_exception_handler` is registered separately, against that
exception type directly.

<Callout variant="note">

The validation handler also runs `ValidationNormalizer`, which is what turns
Pydantic's nested `loc`/`type`/`msg` output into the flat `details` map. The
middleware alone would classify a validation error correctly but would not
beautify it.

</Callout>

## What gets caught

The middleware registers two classifiers of its own, on top of the core
defaults:

| Classifier | Priority | Handles |
|---|---|---|
| `FastAPIValidationErrorClassifier` | 210 | `RequestValidationError` |
| `FastAPIHTTPExceptionClassifier` | 200 | FastAPI and Starlette `HTTPException` |

`HTTPException` maps its status code to a category through the shared
[status-code table](/docs/categories), and carries `exc.detail` through as the
response message. Anything unrecognised falls through to
`GenericExceptionClassifier` and returns `INTERNAL_SERVER_ERROR` with a 500.

## Caveats

Errium depends on `fastapi`, not `fastapi[standard]`, so installing it does not
give you a server. Install `uvicorn` yourself if you need one.
