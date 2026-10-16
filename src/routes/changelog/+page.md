---
title: Changelog
description: Every released version of Errium.
group: Project
order: 3
---

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.2.0 — unreleased

Found by an outside-in black-box test of 0.1.2 (17 findings). This release adds
new `code` values, so clients that switch exhaustively on `code` should handle
them.

**Fixed**

- The error path can no longer raise. An exception whose `__str__` or `__repr__`
  fails, or whose arguments are unprintable, now produces the standard envelope
  on every adapter. A last-resort handler returns a generic
  `INTERNAL_SERVER_ERROR` with a fresh `trace_id` if classification or
  formatting itself fails.
- FastAPI: `HTTPException`, unknown-route 404, 405 and body-parse 400 responses
  are now Errium envelopes instead of raw `{"detail": ...}`, and
  `HTTPException(500, "secret")` no longer leaks its message in production.
- Ninja: a bare pydantic `ValidationError` from a view — typically a `response=`
  schema mismatch — is now a 500 instead of a 422.
- Django-native exceptions are classified on Ninja and DRF instead of collapsing
  to 500: `PermissionDenied` 403, `SuspiciousOperation` 400,
  `RequestDataTooBig` 413, Django `ValidationError` 422/400, `ObjectDoesNotExist`
  404.
- Flask no longer drops `Retry-After` and `Allow`.

**Changed**

- `code` now matches `status_code` for HTTP errors: 400 `BAD_REQUEST`, 405
  `METHOD_NOT_ALLOWED`, 406 `NOT_ACCEPTABLE`, 408/504 `TIMEOUT`, 409 `CONFLICT`,
  410 `GONE`, 413 `PAYLOAD_TOO_LARGE`, 415 `UNSUPPORTED_MEDIA_TYPE`, 429
  `RATE_LIMITED`, 502/503 `SERVICE_UNAVAILABLE`; any other 4xx is `BAD_REQUEST`.
  A plain HTTP 409 is `CONFLICT`; a database uniqueness violation is still
  `DUPLICATE_RESOURCE`.
- In production, 502/503/504 keep their code with a generic message; every other
  5xx still collapses to `INTERNAL_SERVER_ERROR`, and no 5xx carries `details`.
- A body that is not parseable JSON is `400 BAD_REQUEST` on every adapter
  (FastAPI used to answer 422).
- Response sizes are bounded: `details` to 50 entries (with `_truncated`),
  `debug.message` to 2,000 characters, `debug.stack_trace` to 20,000. Debug
  output for validation errors no longer echoes the request `input`.
- **Breaking for some clients:** DRF `details` uses the key `_` instead of
  `non_field_errors`, and joins several messages for one field with `"; "`.
- `ERRIUM_DEBUG` accepts `on` and ignores surrounding whitespace; the mode is
  logged at import.

**Added**

- `errium.install(app)` for FastAPI, and `errium.handlers.http_handler`.
- Logging of every handled exception on the `errium` logger, an `X-Trace-Id`
  header, `request.state.errium_trace_id` / `flask.g.errium_trace_id` /
  `request.errium_trace_id` / `current_trace_id()`, and `ERRIUM_TRUST_REQUEST_ID`.
- Protocol headers (`Allow`, `Retry-After`, `WWW-Authenticate`, `Location`,
  `Content-Range`) are preserved on error responses.
- The `errium_django` package — `handler400/403/404/500` and
  `ErriumDjangoMiddleware` — and a `django` extra.
- Database classification for Django's ORM, `sqlite3`, `psycopg`, `psycopg2`,
  `asyncpg` and `pymysql`.
- Public classifier registration: `errium.register(...)`, and `classifiers=` /
  `engine=` on every adapter, `make_exception_handler()` and
  `settings.ERRIUM["CLASSIFIERS"]` for DRF.
- `__version__` on every package; the `Framework :: Django` classifier.

## 0.1.2 — 2026-09-15

A documentation-only release. No code changes; published so the new
documentation site is linked from the PyPI project page, which snapshots
project metadata and the README per version.

**Changed**

- Documentation moved to this site. The `Homepage` and `Documentation` project
  URLs now point here instead of at the previous MkDocs site on GitHub Pages,
  and the README links here.
- The MkDocs site at `dagin34.github.io/errium` is retired. It now serves only
  a notice pointing to the new domain.

## 0.1.1 — 2026-09-03

A documentation-only release. No code changes; published so the updated README
renders on the PyPI project page, which snapshots it per version.

**Changed**

- The README gained PyPI, Python version, licence and CI badges; documents the
  `flask`, `ninja` and `drf` extras together; notes the shipped `py.typed`
  markers; and flags that a server (`uvicorn`) must be installed separately,
  since Errium depends on `fastapi` rather than `fastapi[standard]`.

**Added**

- A changelog.

## 0.1.0 — 2026-09-03

First public release, published on PyPI.

**Added**

- **Core pipeline** (`errium_core`) — the framework-agnostic
  `ClassificationEngine`, the `ExceptionClassifier` protocol, the
  `ClassifiedError` / `StandardizedError` contracts, `DefaultFormatter` and
  `ValidationNormalizer`. Framework and SQLAlchemy exception types are detected
  by duck-typing rather than importing them, so the core stays
  dependency-light.
- **FastAPI adapter** (`errium`) — `ErriumMiddleware` for uncaught and HTTP
  exceptions, plus `validation_exception_handler` for `RequestValidationError`
  with beautified `details`.
- **Flask adapter** (`errium_flask`) — the `ErriumFlask` extension, covering
  Werkzeug HTTP exceptions, uncaught exceptions, and pydantic validation errors
  raised inside views.
- **Django Ninja adapter** (`errium_ninja`) — `register_errium(api)`,
  overriding Ninja's built-in handlers for `ValidationError`, `HttpError`,
  `Http404` and `Exception`.
- **Django REST Framework adapter** (`errium_drf`) — `errium_exception_handler`,
  wired through `REST_FRAMEWORK["EXCEPTION_HANDLER"]`, with its own
  `flatten_drf_errors` normalizer.
- **Database classification** — `DatabaseExceptionClassifier` maps SQLAlchemy
  errors to `DATABASE_ERROR`, and uniqueness violations to
  `DUPLICATE_RESOURCE`, with no hard SQLAlchemy dependency.
- **Dev vs. prod sanitization** — `ERRIUM_DEBUG` controls whether 5xx responses
  are sanitized and whether a `debug` block with the stack trace and hints is
  attached.
- **Typing** — all five packages ship a `py.typed` marker; the source is checked
  under `mypy --strict`.

---

Errium is MIT licensed.
