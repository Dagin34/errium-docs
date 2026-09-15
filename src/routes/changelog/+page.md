---
title: Changelog
description: Every released version of Errium.
group: Project
order: 3
---

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
