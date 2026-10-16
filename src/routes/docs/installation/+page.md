---
title: Installation
description: Install Errium and the adapter for your framework.
group: Getting Started
order: 2
---

<script>
	import Tabs from '$lib/components/Tabs.svelte';
	import TabPanel from '$lib/components/TabPanel.svelte';
	import Callout from '$lib/components/Callout.svelte';
</script>

Errium requires **Python 3.11+**. The base install ships the core plus the
FastAPI adapter; every other framework is an extra.

## Install

<Tabs group="installer" tabs={['pip', 'uv']}>
<TabPanel value="pip" index={0}>

```bash
pip install errium
```

</TabPanel>
<TabPanel value="uv" index={1}>

```bash
uv pip install errium
```

</TabPanel>
</Tabs>

## Framework extras

Flask, Django Ninja, and Django REST Framework each ship as an extra, and the
`django` extra installs just Django for the [Django helpers](/docs/django).
FastAPI needs no extra — it is part of the base install.

<Tabs group="installer" tabs={['pip', 'uv']}>
<TabPanel value="pip" index={0}>

```bash
pip install "errium[flask]"   # Flask
pip install "errium[ninja]"   # Django Ninja
pip install "errium[drf]"     # Django REST Framework
pip install "errium[django]"  # Django helpers only
```

</TabPanel>
<TabPanel value="uv" index={1}>

```bash
uv pip install "errium[flask]"   # Flask
uv pip install "errium[ninja]"   # Django Ninja
uv pip install "errium[drf]"     # Django REST Framework
uv pip install "errium[django]"  # Django helpers only
```

</TabPanel>
</Tabs>

<Callout variant="warning">

Errium depends on `fastapi`, not `fastapi[standard]`, so it stays light for
Flask and Django users who have no use for a Starlette server. If you were
relying on Errium to pull in a server, install one yourself — for example
`uv pip install uvicorn`.

The base install requires `fastapi` and `starlette`, so the Flask, Ninja and DRF
extras install them too. Their adapters never import FastAPI at run time; it is
install footprint only.

</Callout>

## Type checking

All six packages — `errium`, `errium_core`, `errium_flask`, `errium_ninja`,
`errium_drf` and `errium_django` — ship a `py.typed` marker, so mypy and pyright
read Errium's annotations directly with no stub package required.

## Version

Each package exposes `__version__`, read from the installed distribution:

```python
import errium

print(errium.__version__)
```

Next, wire it into your app in the [Quickstart](/docs/quickstart).
