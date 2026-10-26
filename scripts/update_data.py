#!/usr/bin/env python3
"""Export only public benchmark measurements from a local LLMBench checkout."""
import importlib.util
import json
import pathlib
import sys

SITE = pathlib.Path(__file__).resolve().parents[1]
BENCH = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else SITE.parent
source = BENCH / 'dashboard' / 'refresh.py'
if not source.is_file():
    raise SystemExit('Provide the path to a local LLMBench checkout containing dashboard/refresh.py.')
spec = importlib.util.spec_from_file_location('llmbench_refresh', source)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
snapshot = module.snapshot()
fields = ('model','effort','speed','task','rep','time','status','passed','response','total','seconds','taskVersion')
records = []
for row in snapshot['results']:
    if row.get('effort') == 'ultra':
        continue
    clean = {k: row.get(k) for k in fields}
    clean['source'] = 'Benchmark run'
    records.append(clean)
public = {'generated':snapshot['generated'], 'catalogTime':snapshot['catalogTime'], 'models':snapshot['models'], 'results':records, 'skipped':snapshot['skipped'], 'comboCount':snapshot['comboCount']}
out = SITE / 'data' / 'results.json'
out.write_text(json.dumps(public, indent=2, sort_keys=True) + '\n', encoding='utf-8')
print(f'Exported {len(records)} sanitized measurement records to {out.relative_to(SITE)}')
