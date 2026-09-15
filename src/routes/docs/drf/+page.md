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
and throttling keep working as DRF clients expect.

## Classifiers

| Classifier | Priority | Handles |
|---|---|---|
| `DRFValidationErrorClassifier` | 210 | DRF `ValidationError`, keeping its own status |
| `DRFAPIExceptionClassifier` | 200 | The `APIException` family |
| `DjangoHttp404Classifier` | 200 | `Http404` |
| `DjangoPermissionDeniedClassifier` | 200 | Django's `PermissionDenied` → 403 |

Note the last one is Django's own `django.core.exceptions.PermissionDenied`,
which is distinct from DRF's `PermissionDenied` — the latter is an
`APIException` and is handled by the row above it.

## Validation details

DRF's `ValidationError.detail` is a recursive tree of already human-readable
`ErrorDetail` strings, which is a different shape from Pydantic's
`loc`/`type`/`msg` list. So this adapter does **not** use `ValidationNormalizer`
— it has its own `flatten_drf_errors`, which walks that tree and flattens it to
the same `{field: message}` map. See [Validation](/docs/validation).
