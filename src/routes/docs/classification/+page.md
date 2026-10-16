---
title: The classification engine
description: How an exception resolves to a category, a status, and a message.
group: Concepts
order: 3
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

`ClassificationEngine` holds a list of classifiers sorted by priority, highest
first. `classify(exc)` walks that list in order and returns the first non-`None`
result. If nothing matches, it falls back to `GenericExceptionClassifier`.

## The protocol

A classifier is anything satisfying `ExceptionClassifier`:

```python
from typing import Protocol

from errium_core.contracts.classified_error import ClassifiedError


class ExceptionClassifier(Protocol):
    @property
    def priority(self) -> int:
        """The evaluation priority of this classifier.

        Higher priorities are evaluated first.
        """
        ...

    def classify(self, exc: Exception) -> ClassifiedError | None: ...
```

It's a `Protocol`, so there is no base class to inherit. Any object with a
`priority` property and a `classify` method qualifies.

<Callout variant="warning">

A classifier must **return `None`**, never raise, when it doesn't handle an
exception. `None` is how it says "not my type, try the next one." Raising from
inside a classifier breaks the chain and escapes the handler that was supposed
to be turning exceptions into responses.

</Callout>

## Priority ordering

`register()` appends the classifier and re-sorts the list descending by
priority. A classifier without a `priority` attribute defaults to 100.

| Classifier | Priority | Registered by |
|---|---|---|
| Classifiers added with [`errium.register(...)`](/docs/custom-classifiers) | 300 | You |
| Adapter validation classifiers | 210–215 | Each adapter |
| Adapter HTTP classifiers | 200 | Each adapter |
| `DjangoExceptionClassifier` | 190 | The Ninja and DRF adapters |
| `ValidationExceptionClassifier` | 150 | Always, on construction |
| `DatabaseExceptionClassifier` | 140 | Always, on construction |
| Unspecified | 100 | Default for anything else |
| `GenericExceptionClassifier` | — | Fallback, outside the list |

The two core classifiers are registered by `__init__`, so every engine has them
regardless of framework. Adapters then register their own on top at 200 and
above, so framework-specific handling always wins over the generic core
matching.

## The fallback

`GenericExceptionClassifier` has no `priority` property and is not part of the
sorted list. It is stored separately as `fallback_classifier` and consulted
only when every registered classifier has returned `None`. Its `classify`
returns `ClassifiedError` rather than `ClassifiedError | None` — it always
matches, always `INTERNAL_SERVER_ERROR` with a 500.

That is what guarantees the engine always produces a result, which in turn is
what lets the DRF adapter [never return `None`](/docs/drf).

## The always-registered classifiers

`ValidationExceptionClassifier` (150) matches a Pydantic `ValidationError`, or
anything whose class name is `RequestValidationError`. It returns
`VALIDATION_ERROR` with a 422 — unless every error is a `json_invalid` one,
meaning the body was not parseable JSON, in which case it returns
`BAD_REQUEST` with a 400 and the message "Malformed request body." on every
adapter.

`DatabaseExceptionClassifier` (140) matches database exceptions by walking the
MRO for a known module path — SQLAlchemy, Django's ORM (`django.db`), and the
`sqlite3`, `psycopg`, `psycopg2`, `asyncpg` and `pymysql` drivers — with no
dependency on any of them. See [Core building blocks](/architecture/core).

`DjangoExceptionClassifier` (190) is detected the same duck-typed way. It
maps Django's own exceptions to the status Django itself would use:
`PermissionDenied` → 403, `SuspiciousOperation` → 400,
`RequestDataTooBig` / `TooManyFieldsSent` → 413,
`ObjectDoesNotExist` → 404, and Django's `ValidationError` → 422 (400 on DRF).
The Ninja and DRF adapters register it; the FastAPI and Flask engines do not.

## One registry, every engine

Classifiers registered with `errium.register(...)` or
`errium_core.register_classifier(...)` live in a process-wide registry that every
engine merges in at classification time, sorted by priority with its own. That
is why one registration applies to every adapter and every entry point.

Next: [writing your own](/docs/custom-classifiers).
