const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const template = fs.readFileSync(path.join(__dirname, '../src/template.html'), 'utf8');
const script = template.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const context = { globalThis: {} };
vm.runInNewContext(script, context);
const { aggregate, validModel } = context.globalThis.LLMBenchCore;
const run = (time, response, task='a', taskVersion='v1', extra={}) => ({ model:'gpt-6-sol', effort:'high', speed:'fast', status:'completed', time, response, seconds:response / 10, task, taskVersion, ...extra });
const data = [
  run('2026-01-01', 10), run('2026-01-02', 20), run('2026-01-03', 30), run('2026-01-04', 40),
  run('2026-01-05', 999, 'other', 'v2', {status:'failed', error:'rate limited'}),
  run('2025-12-31', 1000, 'other', 'v2'),
];
let result = aggregate(data, 'gpt-6-sol', 'high', 'fast');
assert.equal(result.response, 30);
assert.equal(result.seconds, 3);
assert.equal(result.runs.length, 3);
assert.equal(result.saved.length, 6);
assert.equal(result.saved[0].error, 'rate limited');
result = aggregate([...data, run('2026-01-06', 80, 'a', null)], 'gpt-6-sol', 'high', 'fast');
assert.equal(result.response, 80);
assert.equal(result.runs.length, 1);
assert.equal(result.verified, false);
result = aggregate([...data, run('2026-01-06', 80, 'a', 'unknown')], 'gpt-6-sol', 'high', 'fast');
assert.equal(result.runs.length, 1);
assert.equal(result.verified, false);
result = aggregate([...data, run('2026-01-06', 80, 'a', 'v1', {taskVersionVerified:false})], 'gpt-6-sol', 'high', 'fast');
assert.equal(result.runs.length, 1);
result = aggregate([...data, run('2026-01-06', 80, 'a', 'v1', {seconds:null})], 'gpt-6-sol', 'high', 'fast');
assert.equal(result.seconds, null);
assert.equal(result.response, 50);
result = aggregate([run('2026-01-01', null), run('2026-01-02', 2, 'a', 'v1', {status:'429'})], 'gpt-6-sol', 'high', 'fast');
assert.equal(result.response, null);
assert.equal(result.saved.length, 2);
assert.equal(validModel('gpt-5.9-sol'), false);
assert.equal(validModel('gpt-6.1-sol'), true);
assert.equal(validModel('gpt-6-ultra'), false);
assert.equal(context.globalThis.LLMBenchCore.efforts.includes('ultra'), false);
console.log('Aggregation and eligibility tests passed');
