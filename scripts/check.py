#!/usr/bin/env python3
"""Check that the public snapshot contains only the allowed measurement fields."""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'data' / 'results.json').read_text(encoding='utf-8'))
assert set(data) == {'generated','catalogTime','models','results','skipped','comboCount'}
assert all(set(m) == {'name','efforts','speeds'} for m in data['models'])
allowed = {'model','effort','speed','task','rep','time','status','passed','response','total','seconds','taskVersion','source'}
assert all(set(r) == allowed and r['effort'] != 'ultra' and r['source'] == 'Benchmark run' for r in data['results'])
for file in (ROOT/'data'/'results.json', ROOT/'public'/'index.html'):
    text = file.read_text(encoding='utf-8')
    assert not re.search(r'\bsk-[A-Za-z0-9_-]{20,}\b|eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}|/Users/[^/]+/', text), file
print(f'Validated {len(data["results"])} public measurement records and built HTML.')
