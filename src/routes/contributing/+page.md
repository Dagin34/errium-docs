---
title: Contributing
description: Setup, testing, style, and commit conventions.
group: Project
order: 2
---

Errium welcomes bug reports, feature requests and pull requests.

## Development setup

Errium uses [`uv`](https://docs.astral.sh/uv/).

```bash
git clone https://github.com/Dagin34/errium.git
cd errium
uv sync
uv pip install -e .
```

## Testing

High coverage is expected on all core operations. Changes need unit and
integration tests under `tests/` — see [Testing layout](/architecture/testing)
for how the suite is organised.

```bash
uv run pytest
uv run pytest --tb=short
```

## Code style

PEP 8, strong static typing, structural cleanliness. The source is checked
under `mypy --strict`.

```bash
uv run ruff check .
```

CI runs `ruff check`, `ruff format --check`, `mypy` and `pytest` across Python
3.11 and 3.12, so running these locally first saves a round trip.

## Commit conventions

Angular style — `<type>(<scope>): <subject>`.

| Type | Use |
|---|---|
| `feat` | A new feature — `feat(core): implement validation beautifier` |
| `fix` | A bug fix — `fix(fastapi): correct HTTPException status mapping` |
| `docs` | Documentation-only changes |
| `style` | Changes that don't affect logic — whitespace, formatting |
| `refactor` | Neither fixes a bug nor adds a feature |
| `test` | Adding or correcting tests |

## Branch naming

- Features — `feature/short-desc` or `feat/short-desc`
- Bug fixes — `bugfix/short-desc` or `fix/short-desc`
- Documentation — `docs/short-desc`

## Pull requests

Before submitting:

1. Tests pass.
2. No lint errors (`uv run ruff check .`).
3. Changes are minimal and focused — don't combine unrelated features in one PR.
4. The description explains what the change does and why it was needed.

## Documentation

The library repository also builds an mkdocs site from its root `.md` files;
`uv run mkdocs serve` previews it.
