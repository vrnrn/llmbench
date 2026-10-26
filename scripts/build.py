#!/usr/bin/env python3
"""Build the self-contained public dashboard from the checked-in sanitized snapshot."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
source = (ROOT / 'src' / 'template.html').read_text(encoding='utf-8')
if source.count('__BENCHMARK_DATA__') != 1:
    raise SystemExit('Expected exactly one dashboard data placeholder.')
data = json.loads((ROOT / 'data' / 'results.json').read_text(encoding='utf-8'))
payload = json.dumps(data, ensure_ascii=True, separators=(',', ':')).replace('<', '\\u003c')
out = ROOT / 'public' / 'index.html'
out.parent.mkdir(parents=True, exist_ok=True)
html = source.replace('__BENCHMARK_DATA__', payload)
out.write_text(html, encoding='utf-8')
worker = ROOT / 'src' / 'worker.js'
worker.write_text('const html = ' + json.dumps(html, ensure_ascii=True) + ';\nexport default { async fetch() { return new Response(html, { headers: { \"content-type\": \"text/html; charset=utf-8\", \"cache-control\": \"no-cache\" } }); } };\n', encoding='utf-8')
print('Built', out.relative_to(ROOT), 'and', worker.relative_to(ROOT))
