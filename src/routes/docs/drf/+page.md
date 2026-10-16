---
title: Django REST Framework
description: A settings hook with no middleware, and the 400-vs-422 decision.
group: Frameworks
order: 4
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

```bash
pip install "errium[drf]"
```

## Integration

No middleware, no registration call — just a settings key:

```python:settings.py
REST_FRAMEWORK = {
    "EXCEPTION_HANDLER": "errium_drf.errium_exception_handler",
}
```

`errium_exception_handler(exc, context)` is a plain function. DRF resolves it
from that dotted path.

To add your own classifiers, list them in settings (dotted paths; a class is
instantiated with no arguments), or build a handler bound to its own engine:

```python:settings.py
ERRIUM = {"CLASSIFIERS": ["myapp.classifiers.QuotaExceededClassifier"]}
```

```python
from errium_drf import make_exception_handler

errium_exception_handler = make_exception_handler(classifiers=[...])  # or engine=...
```

See [custom classifiers](/docs/custom-classifiers).

## The 400-vs-422 decision

<Callout variant="warning">

A validation error returns **422** on FastAPI, Flask and Django Ninja, but
**400** on DRF. This is deliberate. `DRFValidationErrorClassifier` passes
through `exc.status_code` — DRF's own default — rather than forcing the other
adapters' 422 onto an established DRF convention that existing clients already
depend on.

The response *shape* is identical across all four adapters either way. Only
this one status code differs.

</Callout>

## Full coverage from a settings hook alone

`APIView.dispatch()` wraps every view call in `except Exception:` and routes it
to `handle_exception()`, which calls the configured exception handler.

DRF's own default handler returns `None` for anything that isn't an
`APIException`, `Http404`, or `PermissionDenied` — and a `None` return makes
`handle_exception` re-raise into Django's plain 500 handling.

`errium_exception_handler` never returns `None`. The
`GenericExceptionClassifier` fallback covers everything the specific
classifiers don't, so an uncaught `KeyError` in a view gets the standard
contract like anything else. That is how the adapter reaches catch-everything
parity with the other three through the settings hook alone, with no extra
middleware.

## Headers

`APIView.handle_exception` sets `auth_header` and `wait` on the exception
before calling the handler. Errium mirrors DRF's own behaviour and turns those
into `WWW-Authenticate` and `Retry-After` response headers, so auth challenges
and throttling keep working as DRF clients expect. Every error response also
carries `X-Trace-Id`, and `request.errium_trace_id` is available in your views.

## Classifiers

| Classifier | Priority | Handles |
|---|---|---|
| `DRFValidationErrorClassifier` | 210 | DRF `ValidationError`, keeping its own status |
| `DRFAPIExceptionClassifier` | 200 | The `APIException` family |
| `DjangoHttp404Classifier` | 200 | `Http404` |
| `DjangoPermissionDeniedClassifier` | 200 | Django's `PermissionDenied` → 403 |
| `DjangoExceptionClassifier` | 190 | `SuspiciousOperation` → 400, `RequestDataTooBig` → 413, Django `ValidationError` → 400, `ObjectDoesNotExist` → 404 |

Note the last one is Django's own `django.core.exceptions.PermissionDenied`,
which is distinct from DRF's `PermissionDenied` — the latter is an
`APIException` and is handled by the row above it.

## Validation details

DRF's `ValidationError.detail` is a recursive tree of already human-readable
`ErrorDetail` strings, which is a different shape from Pydantic's
`loc`/`type`/`msg` list. So this adapter does **not** use `ValidationNormalizer`
— it has its own `flatten_drf_errors`, which walks that tree and flattens it to
the same `{field: message}` map: several messages for one field are joined with
`"; "`, and DRF's `non_field_errors` becomes the key `_`. See
[Validation](/docs/validation).

Database errors from Django's ORM are classified too: a unique violation is 409
`DUPLICATE_RESOURCE`, other `django.db` errors are `DATABASE_ERROR`.

A body larger than Django's `DATA_UPLOAD_MAX_MEMORY_SIZE` raises
`RequestDataTooBig`, which is now a 413 `PAYLOAD_TOO_LARGE` rather than a 500.
