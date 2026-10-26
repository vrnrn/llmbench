const { spawnSync } = require('node:child_process');
const path = require('node:path');
const tests = ['aggregation.test.cjs', 'render.test.cjs'].map(name => path.join(__dirname, '..', 'tests', name));
const result = spawnSync(process.execPath, ['--test', ...tests], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
