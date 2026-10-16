---
title: Roadmap
description: What's built, and what's planned.
group: Project
order: 1
---

Errium's core is framework-agnostic by design, so most of the work ahead is
adding thin adapters on top of it rather than changing it.

## Done

- **Core classification pipeline** — `ClassificationEngine`, the
  `ExceptionClassifier` protocol, the `StandardizedError` / `ClassifiedError`
  contracts, `DefaultFormatter`, `ValidationNormalizer`, and dev/prod
  sanitization via `ERRIUM_DEBUG`.
- **FastAPI adapter** — `ErriumMiddleware` plus `validation_exception_handler`
  with beautified `details`.
- **Flask adapter** — `ErriumFlask`, covering Werkzeug HTTP exceptions, generic
  exceptions, and pydantic validation errors raised inside views.
- **Django Ninja adapter** — `register_errium(api)`, overriding Ninja's built-in
  defaults and stripping its synthetic parameter-name wrapper from validation
  error locations.
- **Django REST Framework adapter** — `errium_exception_handler`, with full
  catch-everything coverage including raw uncaught exceptions, its own
  `flatten_drf_errors` normalizer, and DRF's header behaviour mirrored.
- **Database error classification** — SQLAlchemy errors to `DATABASE_ERROR`,
  uniqueness violations to `DUPLICATE_RESOURCE`, with no hard SQLAlchemy
  dependency.
- **Published on PyPI** — with `flask`, `ninja` and `drf` extras. All five
  packages ship `py.typed`.
- **CI** — GitHub Actions running `ruff check`, `ruff format --check`, `mypy`
  and `pytest` across Python 3.11 and 3.12 on every push and PR to `main`.
- **0.2.0 hardening** — found by an outside-in black-box test of 0.1.2:
  `errium.install(app)` and an `HTTPException` handler for FastAPI; an error path
  that cannot raise; ten more error categories and consistent production
  sanitization; logging and trace-id exposure; protocol headers; Django-native and
  ORM error classification; the `errium_django` helpers; public classifier
  registration; bounded response sizes. See the [changelog](/changelog).
- **Documentation site** — this site, replacing the earlier MkDocs build. Since
  0.1.2 the package's `Homepage` and `Documentation` URLs point here.

## Known limitations

- **Mid-stream failures cannot be normalized.** If a streaming response raises
  after its first chunk, the status line and headers are already sent, so the
  connection simply ends. This holds on every adapter.
- A mounted FastAPI sub-app needs its own `errium.install(...)`.
- Django's `DEBUG = True` technical 500 page replaces `handler500`, and errors
  in middleware listed before `ErriumDjangoMiddleware` are only covered by
  `handler500`.
- Message wording for validation errors still differs between frameworks, and
  Flask's JSON key order is alphabetical.
- Development status is still Alpha.

## Planned

- **Express.js adapter (JavaScript port)** — a separate package outside the
  Python distribution. This needs its own port of the core contracts, not just
  an adapter, so it is a larger piece of work than the four Python adapters
  were.
- **AI-powered developer suggestions and self-healing hints** — extending the
  formatter's debug hints, currently a static status-code-keyed lookup, with
  more context-aware and possibly model-generated suggestions in debug mode.

## Picking up a new adapter

Follow the pattern in [Adapter internals](/architecture/adapters): a new
`src/errium_<framework>` package containing framework-specific
`ExceptionClassifier`s, plus one integration point that builds a
`ClassificationEngine`, classifies, formats, and returns the framework's native
response type.

Nothing in `errium_core` should need to change to support a new framework. If
it does, that is worth raising as an issue before working around it.

See [Contributing](/contributing) for setup and conventions.
