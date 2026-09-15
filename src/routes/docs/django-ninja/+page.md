---
title: Django Ninja
description: Overriding Ninja's defaults, and the parameter-name quirk.
group: Frameworks
order: 3
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

```bash
pip install "errium[ninja]"
```

## Integration

```python:api.py
from ninja import NinjaAPI
from errium_ninja import register_errium

api = NinjaAPI()
register_errium(api)
```

`register_errium(api)` registers one shared handler against four exception
types via `api.exception_handler(...)`:

- `ninja.errors.ValidationError`
- `ninja.errors.HttpError` — including its `AuthenticationError`,
  `AuthorizationError` and `Throttled` subclasses
- `django.http.Http404`
- the base `Exception`

## Why it overrides Ninja's defaults

Ninja installs its own handlers for all four of those types, and registering
Errium deliberately replaces them.

<Callout variant="warning">

Ninja's default `Exception` handler **re-raises** when Django's `DEBUG` is off,
letting Django render its own error page instead of returning JSON. An API
running in production with Ninja's defaults answers an uncaught exception with
Django's HTML 500, not a JSON body. Overriding it is the point of the adapter.

</Callout>

## The parameter-name quirk

Ninja wraps a single Schema-typed body or form parameter behind a synthetic
field named after the endpoint's own parameter. For this endpoint:

```python
@api.post("/users")
def create_user(request, payload: UserCreate):
    ...
```

a missing `password` arrives with `loc` of `("body", "payload", "password")` —
where `payload` is the *Python parameter name*, not anything the client sent.

`_flatten_ninja_errors()` drops that segment, so `details` comes back keyed on
`password` exactly as it would from FastAPI or Flask, rather than leaking an
internal name to your API consumers. Query, path and header params don't get
the wrapper; Ninja already flattens those.

## Classifiers

| Classifier | Priority | Handles |
|---|---|---|
| `NinjaValidationErrorClassifier` | 210 | Ninja's `ValidationError` → 422 |
| `NinjaHttpErrorClassifier` | 200 | `HttpError` and subclasses |
| `DjangoHttp404Classifier` | 200 | `Http404`, e.g. from `get_object_or_404` |
