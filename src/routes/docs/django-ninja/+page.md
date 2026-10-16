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

`register_errium(api)` also accepts `classifiers=[...]` and `engine=` — see
[custom classifiers](/docs/custom-classifiers).

It registers one shared handler against four exception
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
| `NinjaResponseValidationClassifier` | 215 | A bare pydantic `ValidationError` → 500 |
| `NinjaValidationErrorClassifier` | 210 | Ninja's `ValidationError` → 422 |
| `NinjaHttpErrorClassifier` | 200 | `HttpError` and subclasses |
| `DjangoHttp404Classifier` | 200 | `Http404`, e.g. from `get_object_or_404` |
| `DjangoExceptionClassifier` | 190 | Django's own exceptions (below) |

## Django's own exceptions

Overriding Ninja's `Exception` handler would otherwise discard Django's usual
mapping and turn everything into a 500. `DjangoExceptionClassifier` restores it:

| Raised in a view | Response |
|---|---|
| `PermissionDenied` | 403 `AUTHORIZATION_ERROR` |
| `SuspiciousOperation` | 400 `BAD_REQUEST` |
| `RequestDataTooBig`, `TooManyFieldsSent` | 413 `PAYLOAD_TOO_LARGE` |
| `ObjectDoesNotExist` (and `Model.DoesNotExist`) | 404 `RESOURCE_NOT_FOUND` |
| `django.core.exceptions.ValidationError` | 422 `VALIDATION_ERROR`, with `details` |
| `django.db.IntegrityError` (unique) | 409 `DUPLICATE_RESOURCE` |
| other `django.db` errors | 500 (`DATABASE_ERROR` in debug) |

## Response-schema mismatches are a 500

When an endpoint declares `response=` and returns data that does not match, Ninja
raises a bare pydantic `ValidationError` while serializing. That is a bug in
your server, not in the request, so Errium reports it as a **500** instead of a
422 that would blame the client. Request validation
(`ninja.errors.ValidationError`) is still 422.

## Errors outside your views

An unknown URL, a URL-converter mismatch, and Ninja's own 405 never reach these
handlers; Django renders them as HTML. The [Django helpers](/docs/django)
cover them.
