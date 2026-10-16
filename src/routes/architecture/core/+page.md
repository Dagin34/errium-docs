---
title: Core building blocks
description: Contracts, classification, formatting, normalization, settings, tracing.
group: Architecture
order: 2
---

<script>
	import Callout from '$lib/components/Callout.svelte';
</script>

Everything in `errium_core` falls into a handful of groups: contracts, classification, the shared pipeline, formatting, normalization, settings, and tracing.

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
`ValidationError` or anything class-named `RequestValidationError`, and returns
`VALIDATION_ERROR` with a 422 — or `BAD_REQUEST` with a 400 when every error is
`json_invalid` (the body was not parseable JSON).

**`DatabaseExceptionClassifier`** (priority 140) detects database errors by
walking the MRO for a module path under `sqlalchemy`, `django.db`, `sqlite3`,
`psycopg`, `psycopg2`, `asyncpg`, `pymysql` or `MySQLdb` — no import of any of
them. If the exception is an `IntegrityError` (or a driver's `UniqueViolation`)
whose message contains any of these markers:

```python
_DUPLICATE_MARKERS = (
    "unique constraint",
    "duplicate key",
    "duplicate entry",
    "already exists",
)
```

it returns `DUPLICATE_RESOURCE` with a 409. Any other database error returns
`DATABASE_ERROR` with a 500.

<Callout variant="note">

The duplicate check is a substring match on the lowercased message, because
integrity-violation wording differs between Postgres, MySQL and SQLite. It is
a heuristic, not a parse — a driver phrasing its uniqueness violation
differently would fall through to `DATABASE_ERROR`.

</Callout>

**`DjangoExceptionClassifier`** (`django_native.py`, priority 190) maps Django's
own exceptions — `PermissionDenied`, `SuspiciousOperation`,
`RequestDataTooBig`, `ObjectDoesNotExist`, `Http404`, and Django's
`ValidationError` — by the same duck-typing, with a configurable validation
status (422 for Ninja, 400 for DRF). It is not an engine default; the Ninja,
DRF and `errium_django` engines register it.

**`GenericExceptionClassifier`** is the fallback and sits outside the sorted
list. It always returns `INTERNAL_SERVER_ERROR` with a 500.

`status_mapping.py` holds `category_for_status_code()`, the shared table in
[Error categories](/docs/categories).

### The registry

`errium_core/registry.py` holds a process-wide list of classifiers. `register()`
builds one from `(exception type, status, category, message)`;
`register_classifier()` adds any classifier. Every `ClassificationEngine`
merges the registry into its own list when it classifies, so one registration
reaches every adapter. `classifiers/loader.py` resolves dotted-path strings for
settings-driven registration (DRF, `errium_django`).

## The pipeline

`errium_core/pipeline.py`

`handle_error(exc, engine=..., formatter=..., details=..., headers=...,
trace_id=...)` is the one classify → format path every adapter calls. It:

- classifies, builds the `StandardizedError`, and formats it;
- merges allow-listed protocol headers from the exception
  (`headers.py`: `Allow`, `Retry-After`, `WWW-Authenticate`, `Location`,
  `Content-Range`) and adds `X-Trace-Id`;
- logs on the `errium` logger — `ERROR` with traceback for 5xx, `WARNING`
  for the rest;
- **never raises.** If anything in that path fails it returns a generic 500
  envelope with a fresh `trace_id`, so a hostile exception cannot turn Errium's
  own handler into an HTML error page.

`safe.py` holds `safe_str(exc, limit)`, which renders an exception without ever
raising (`str`, then `repr`, then the class name) and truncates it.

## Formatting

`errium_core/formatters/`

`ErrorFormatter` is a `Protocol` — `format(error: StandardizedError) -> dict[str, Any]`.
`DefaultFormatter` is the only implementation. It emits the seven standard
fields, reads `get_settings().debug`, and applies the 5xx sanitization rule or
attaches the debug block accordingly. 502/503/504 keep a
`SERVICE_UNAVAILABLE`/`TIMEOUT` code in production; every other 5xx collapses
to `INTERNAL_SERVER_ERROR`. See [Debug vs. production](/docs/debug-mode).

`limits.py` bounds the output: `details` to 50 entries (with a `_truncated`
sentinel), `debug.message` to 2,000 characters and `debug.stack_trace` to
20,000. For validation errors the debug text is rebuilt from `loc`/`msg`/`type`
so the submitted `input` is never echoed.

## Normalization

`errium_core/normalizers/validation.py`

`ValidationNormalizer` turns a Pydantic-shaped error list into a flat map. Full
detail in [Validation normalization](/docs/validation).

## Settings

`errium_core/config/settings.py`

`ErriumSettings(debug, trust_request_id)` is a process-global singleton,
sourced by `load_settings()` from `ERRIUM_DEBUG` and `ERRIUM_TRUST_REQUEST_ID`
at import time (`true`/`1`/`yes`/`on`, whitespace stripped). The mode is logged
once at import. `get_settings()` and `set_settings()` read and replace it.

Because it is read at import, changing the environment variable after the
module is loaded has no effect — use `set_settings()` instead, which is how the
test suite exercises both modes.

## Tracing

`errium_core/tracing/trace.py`

`generate_trace_id()` returns `str(uuid4())`. `resolve_trace_id(request_id)`
picks the id for a request — a fresh uuid4, or a valid inbound `X-Request-ID`
when `ERRIUM_TRUST_REQUEST_ID` is on. `current_trace_id()` reads a `ContextVar`
holding the id of the request in flight. See [Trace IDs](/docs/trace-ids).
