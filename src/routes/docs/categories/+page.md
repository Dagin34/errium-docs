---
title: Error categories
description: The seventeen categories, and how status codes map onto them.
group: Concepts
order: 2
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

`ErrorCategory` is a `StrEnum` defining the closed set of values the response's
`code` field can take. Seventeen categories, and nothing else.

```python
from enum import StrEnum


class ErrorCategory(StrEnum):
    VALIDATION = "VALIDATION_ERROR"
    AUTHENTICATION = "AUTHENTICATION_ERROR"
    AUTHORIZATION = "AUTHORIZATION_ERROR"
    NOT_FOUND = "RESOURCE_NOT_FOUND"
    DUPLICATE = "DUPLICATE_RESOURCE"
    DATABASE = "DATABASE_ERROR"
    INTERNAL = "INTERNAL_SERVER_ERROR"
    BAD_REQUEST = "BAD_REQUEST"
    METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED"
    NOT_ACCEPTABLE = "NOT_ACCEPTABLE"
    TIMEOUT = "TIMEOUT"
    CONFLICT = "CONFLICT"
    GONE = "GONE"
    PAYLOAD_TOO_LARGE = "PAYLOAD_TOO_LARGE"
    UNSUPPORTED_MEDIA_TYPE = "UNSUPPORTED_MEDIA_TYPE"
    RATE_LIMITED = "RATE_LIMITED"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
```

<Callout variant="note">

The member name and the string value differ for some categories. You reference
`ErrorCategory.NOT_FOUND` in Python, but the client sees
`"RESOURCE_NOT_FOUND"` in the `code` field. Client-side code should branch on
the values in the right-hand column.

</Callout>

<Callout variant="warning">

The first seven values are the original set. The other ten were added in 0.2.0:
before that, anything outside the original table came back as
`INTERNAL_SERVER_ERROR`, so a client could not tell a rate limit from a crash.
If your client branches exhaustively on `code`, handle the new values.

</Callout>

## The categories

| `code` value | Member | Typical status |
|---|---|---|
| `VALIDATION_ERROR` | `VALIDATION` | 422 (400 on DRF) |
| `AUTHENTICATION_ERROR` | `AUTHENTICATION` | 401 |
| `AUTHORIZATION_ERROR` | `AUTHORIZATION` | 403 |
| `RESOURCE_NOT_FOUND` | `NOT_FOUND` | 404 |
| `DUPLICATE_RESOURCE` | `DUPLICATE` | 409 (database uniqueness violations) |
| `DATABASE_ERROR` | `DATABASE` | 500 |
| `INTERNAL_SERVER_ERROR` | `INTERNAL` | 500 |
| `BAD_REQUEST` | `BAD_REQUEST` | 400 |
| `METHOD_NOT_ALLOWED` | `METHOD_NOT_ALLOWED` | 405 |
| `NOT_ACCEPTABLE` | `NOT_ACCEPTABLE` | 406 |
| `TIMEOUT` | `TIMEOUT` | 408, 504 |
| `CONFLICT` | `CONFLICT` | 409 |
| `GONE` | `GONE` | 410 |
| `PAYLOAD_TOO_LARGE` | `PAYLOAD_TOO_LARGE` | 413 |
| `UNSUPPORTED_MEDIA_TYPE` | `UNSUPPORTED_MEDIA_TYPE` | 415 |
| `RATE_LIMITED` | `RATE_LIMITED` | 429 |
| `SERVICE_UNAVAILABLE` | `SERVICE_UNAVAILABLE` | 502, 503 |

## Status code mapping

`category_for_status_code()` is the shared table every HTTP exception
classifier uses — FastAPI, Flask, Ninja and DRF alike. Defining it once in the
framework-agnostic core is what keeps the four adapters consistent.

| Status | Category |
|---|---|
| 400 | `BAD_REQUEST` |
| 401 | `AUTHENTICATION_ERROR` |
| 403 | `AUTHORIZATION_ERROR` |
| 404 | `RESOURCE_NOT_FOUND` |
| 405 | `METHOD_NOT_ALLOWED` |
| 406 | `NOT_ACCEPTABLE` |
| 408 | `TIMEOUT` |
| 409 | `CONFLICT` |
| 410 | `GONE` |
| 413 | `PAYLOAD_TOO_LARGE` |
| 415 | `UNSUPPORTED_MEDIA_TYPE` |
| 422 | `VALIDATION_ERROR` |
| 429 | `RATE_LIMITED` |
| 502, 503 | `SERVICE_UNAVAILABLE` |
| 504 | `TIMEOUT` |
| any other 4xx | `BAD_REQUEST` |
| any other status | `INTERNAL_SERVER_ERROR` |

The status code is never changed by the mapping. A 418 becomes `BAD_REQUEST`
and still reports `status_code: 418`; the category only describes it.

## Categories not reached by status

`DATABASE_ERROR` and `DUPLICATE_RESOURCE` are produced by
`DatabaseExceptionClassifier`, which inspects the exception itself rather than a
status code. A uniqueness violation becomes `DUPLICATE_RESOURCE` with a 409; any
other database error becomes `DATABASE_ERROR` with a 500. It recognises
SQLAlchemy, Django's ORM and the common drivers — see
[Core building blocks](/architecture/core).

That is why a plain HTTP 409 (an `HTTPException(409)`, say) is `CONFLICT` while
a database unique violation is `DUPLICATE_RESOURCE`: the first is a status
code, the second is a diagnosis.

## What production keeps

In production a response with status 500 or above has its message replaced
with a generic one. `502`, `503` and `504` keep their `SERVICE_UNAVAILABLE` /
`TIMEOUT` code so a client can still react to "the upstream is down"; every
other 5xx becomes `INTERNAL_SERVER_ERROR`. See
[Debug vs. production](/docs/debug-mode).
