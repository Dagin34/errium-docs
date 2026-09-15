---
title: Quickstart
description: Wire Errium into your app and see the difference in one request.
group: Getting Started
order: 3
---

<script>
	import Tabs from '$lib/components/Tabs.svelte';
	import TabPanel from '$lib/components/TabPanel.svelte';
</script>

Pick your framework. Each one needs a single integration point, except FastAPI,
which needs two for a reason worth understanding — see the
[FastAPI page](/docs/fastapi).

## Wire it up

<Tabs group="framework" tabs={['FastAPI', 'Flask', 'Django Ninja', 'DRF']}>
<TabPanel value="FastAPI" index={0}>

```python:main.py
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from errium import ErriumMiddleware
from errium.handlers.validation_handler import validation_exception_handler

app = FastAPI()

# 1. Catch raw and HTTP exceptions.
app.add_middleware(ErriumMiddleware)

# 2. Catch request validation errors.
app.add_exception_handler(RequestValidationError, validation_exception_handler)
```

</TabPanel>
<TabPanel value="Flask" index={1}>

```python:app.py
from flask import Flask
from errium_flask import ErriumFlask

app = Flask(__name__)

# Covers HTTP exceptions, uncaught exceptions, and pydantic validation errors.
ErriumFlask(app)
```

</TabPanel>
<TabPanel value="Django Ninja" index={2}>

```python:api.py
from ninja import NinjaAPI
from errium_ninja import register_errium

api = NinjaAPI()

# Overrides Ninja's own handlers for ValidationError, HttpError,
# Http404, and Exception.
register_errium(api)
```

</TabPanel>
<TabPanel value="DRF" index={3}>

```python:settings.py
REST_FRAMEWORK = {
    "EXCEPTION_HANDLER": "errium_drf.errium_exception_handler",
}
```

</TabPanel>
</Tabs>

## See the difference

Post a request that fails validation — say a body missing its `password` field.

Without Errium, FastAPI hands back Pydantic's raw output:

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "password"],
      "msg": "Field required",
      "input": null
    }
  ]
}
```

With Errium, the same failure arrives in the standard contract:

```json
{
  "success": false,
  "status_code": 422,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed.",
  "trace_id": "87b003a8-7c15-4a6c-9c76-a05b22b109e2",
  "timestamp": "2026-05-27T12:00:00Z",
  "details": {
    "password": "Password is required."
  }
}
```

Every error your API returns now uses that shape, whether it came from a
validation failure, a `404`, or an uncaught `KeyError`.

Read the field-by-field contract on
[The response contract](/docs/response-shape).
