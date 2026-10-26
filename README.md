# Codex benchmark dashboard

A static public dashboard of native Codex model benchmarks. The page presents measured response tokens per second by model, reasoning effort, and Standard or Fast mode. It uses the arithmetic mean of up to three comparable completed runs and shows the sample count. Individual sanitized measurements remain available in the details.

The benchmark is a small synthetic reconciliation task. Response throughput divides output tokens excluding reasoning by end-to-end turn wall time, including tools, network and waiting; it is not decoder throughput. Results are specific to the account, runtime, task, and measurement date. Ultra is excluded.

## Build

```sh
python3 scripts/build.py
```

The site is self-contained in `public/index.html`; it requires no runtime API or secret. `data/results.json` contains only explicitly selected measurement fields and no raw logs, credentials, or account information. `src/template.html` owns the layout and visualization code.

## Update the snapshot

From this repository, with a local LLMBench checkout available:

```sh
python3 scripts/update_data.py /path/to/LLMBench
python3 scripts/build.py
```

Review the public data, commit the updated snapshot and built page, and deploy the site. The export reads completed local benchmark results and copies an allowlist of numerical and task metadata; it never includes prompts, event logs, local paths, or credentials. It does not run benchmarks.

## Deploy

The generated Worker serves the same self-contained HTML and is configured in `wrangler.jsonc`. Once an authorized Cloudflare account is available, deploy with `npx wrangler deploy`; the configuration includes the custom domain `bench.vrnrn.com`. The repository contains no deployment credentials.
