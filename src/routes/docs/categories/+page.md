---
title: Error categories
description: The seven categories, and how status codes map onto them.
group: Concepts
order: 2
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

`ErrorCategory` is a `StrEnum` defining the closed set of values the response's
`code` field can take. Seven categories, and nothing else.

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
```

<Callout variant="note">

The member name and the string value differ. You reference
`ErrorCategory.NOT_FOUND` in Python, but the client sees
`"RESOURCE_NOT_FOUND"` in the `code` field. Client-side code should branch on
the values in the right-hand column.

</Callout>

## The categories

| `code` value | Member | Typical status |
|---|---|---|
| `VALIDATION_ERROR` | `VALIDATION` | 422 (400 on DRF) |
| `AUTHENTICATION_ERROR` | `AUTHENTICATION` | 401 |
| `AUTHORIZATION_ERROR` | `AUTHORIZATION` | 403 |
| `RESOURCE_NOT_FOUND` | `NOT_FOUND` | 404 |
| `DUPLICATE_RESOURCE` | `DUPLICATE` | 409 |
| `DATABASE_ERROR` | `DATABASE` | 500 |
| `INTERNAL_SERVER_ERROR` | `INTERNAL` | 500 |

## Status code mapping

`category_for_status_code()` is the shared table every HTTP exception
classifier uses — FastAPI, Flask, Ninja and DRF alike. Defining it once in the
framework-agnostic core is what keeps the four adapters consistent.

| Status | Category |
|---|---|
| 401 | `AUTHENTICATION_ERROR` |
| 403 | `AUTHORIZATION_ERROR` |
| 404 | `RESOURCE_NOT_FOUND` |
| 409 | `DUPLICATE_RESOURCE` |
| 422 | `VALIDATION_ERROR` |
| anything else | `INTERNAL_SERVER_ERROR` |

Note the fallback: a status code not in the table — a 418, a 503 — becomes
`INTERNAL_SERVER_ERROR` while keeping its original status code in
`status_code`. The category narrows; the status does not change.

## Categories not reached by status

Two categories never come from the status table.

`DATABASE_ERROR` and `DUPLICATE_RESOURCE` are produced by
`DatabaseExceptionClassifier`, which inspects the exception itself rather than a
status code. A SQLAlchemy `IntegrityError` whose message looks like a
uniqueness violation becomes `DUPLICATE_RESOURCE` with a 409; any other
SQLAlchemy error becomes `DATABASE_ERROR` with a 500. See
[Core building blocks](/architecture/core).
