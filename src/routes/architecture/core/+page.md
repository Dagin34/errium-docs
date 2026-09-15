---
title: Core building blocks
description: Contracts, classification, formatting, normalization, settings, tracing.
group: Architecture
order: 2
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

Everything in `errium_core` falls into six groups.

## Contracts

`errium_core/contracts/`

- **`ErrorCategory`** — the closed set of category strings. See
  [Error categories](/docs/categories).
- **`ClassifiedError`** — the minimal output of classification: `category`,
  `status_code`, `message`. A frozen-shaped dataclass with `slots=True`.
- **`StandardizedError`** — the full internal representation before formatting.
  Adds `trace_id`, `success`, `timestamp`, optional `details`, and the original
  `exception`.

```python
@dataclass(slots=True)
class StandardizedError:
    status_code: int
    code: str
    message: str
    trace_id: str
    success: bool = False
    timestamp: datetime = field(default_factory=lambda: datetime.now(UTC))
    details: dict[str, Any] | None = None
    exception: Exception | None = None
```

Keeping the original `exception` on the contract is what lets the formatter
produce a stack trace in debug mode without the adapter having to pass it
separately.

## Classification

`errium_core/classifiers/`

`ExceptionClassifier` is the `Protocol`; `ClassificationEngine` runs the
ordered list. Both are covered in
[The classification engine](/docs/classification).

Two classifiers are always registered on construction:

**`ValidationExceptionClassifier`** (priority 150) matches a Pydantic
`ValidationError` or anything class-named `RequestValidationError`, and always
returns `VALIDATION_ERROR` with a 422.

**`DatabaseExceptionClassifier`** (priority 140) detects SQLAlchemy errors by
walking the MRO for a `sqlalchemy.` module path — no SQLAlchemy import. If the
exception is an `IntegrityError` whose message contains any of these markers:

```python
_DUPLICATE_MARKERS = (
    "unique constraint",
    "duplicate key",
    "duplicate entry",
    "already exists",
)
```

it returns `DUPLICATE_RESOURCE` with a 409. Any other SQLAlchemy error returns
`DATABASE_ERROR` with a 500.

<Callout variant="note">

The duplicate check is a substring match on the lowercased message, because
integrity-violation wording differs between Postgres, MySQL and SQLite. It is
a heuristic, not a parse — a driver phrasing its uniqueness violation
differently would fall through to `DATABASE_ERROR`.

</Callout>

**`GenericExceptionClassifier`** is the fallback and sits outside the sorted
list. It always returns `INTERNAL_SERVER_ERROR` with a 500.

`status_mapping.py` holds `category_for_status_code()`, the shared table in
[Error categories](/docs/categories).

## Formatting

`errium_core/formatters/`

`ErrorFormatter` is a `Protocol` — `format(error: StandardizedError) -> dict[str, Any]`.
`DefaultFormatter` is the only implementation. It emits the seven standard
fields, reads `get_settings().debug`, and applies the 5xx sanitization rule or
attaches the debug block accordingly. See
[Debug vs. production](/docs/debug-mode).

## Normalization

`errium_core/normalizers/validation.py`

`ValidationNormalizer` turns a Pydantic-shaped error list into a flat map. Full
detail in [Validation normalization](/docs/validation).

## Settings

`errium_core/config/settings.py`

`ErriumSettings(debug: bool)` is a process-global singleton, sourced from
`ERRIUM_DEBUG` at import time. `get_settings()` and `set_settings()` read and
replace it.

Because it is read at import, changing the environment variable after the
module is loaded has no effect — use `set_settings()` instead, which is how the
test suite exercises both modes.

## Tracing

`errium_core/tracing/trace.py`

`generate_trace_id()` returns `str(uuid4())`. That is the entire module. See
[Trace IDs](/docs/trace-ids).
