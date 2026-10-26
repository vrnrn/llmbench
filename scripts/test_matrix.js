const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const template = fs.readFileSync(__dirname + '/../src/template.html', 'utf8');
const models = [{name:'gpt-6-sol', efforts:['low','high','ultra'], speeds:['standard','fast']},{name:'gpt-6-luna', efforts:['low'],speeds:['standard','fast']}];
const run = (speed,time,response,status='completed',task='reconcile',taskVersion='task-v1',seconds=3) => ({model:'gpt-6-sol',effort:'low',speed,time,response,total:100,seconds,status,passed:true,task,rep:1,source:'test',taskVersion});
const data = {models,results:[
  run('standard','2026-01-01T00:00:00Z',10),
  run('standard','2026-01-02T00:00:00Z',20),
  run('standard','2026-01-03T00:00:00Z',25),
  run('standard','2026-01-04T00:00:00Z',40),
  run('standard','2026-01-05T00:00:00Z',999,'completed','ledger','different-task'),
  run('standard','2026-01-06T00:00:00Z',null,'429'),
  run('fast','2026-01-03T00:00:00Z',35)
],generated:'2026-01-07T00:00:00Z',skipped:0};
// Make the most recent measurable sample the desired task, after the unrelated task.
data.results.push(run('standard','2026-01-05T12:00:00Z',40));
// Without a verified version, even matching task names must not be averaged together.
data.results.push({...run('fast','2026-01-01T00:00:00Z',80),model:'gpt-6-luna',taskVersion:null});
data.results.push({...run('fast','2026-01-02T00:00:00Z',90),model:'gpt-6-luna',taskVersion:null});
const script = template.match(/<script>([\s\S]*?)<\/script>/)[1].replace('__BENCHMARK_DATA__',JSON.stringify(data));
const nodes = {};
function node(id){return nodes[id] ||= {value:'all',innerHTML:'',textContent:'',options:[],handlers:{},add(o){this.options.push(o)},addEventListener(type,fn){this.handlers[type]=fn},querySelector(){return null}}}
const document = {getElementById:node};
vm.runInNewContext(script,{document,Option:function(text,value){this.text=text;this.value=value},Intl,Date,Set,String,Number});
assert.match(node('headRow').innerHTML,/>Low</);
assert.match(node('headRow').innerHTML,/>High</);
assert.doesNotMatch(node('headRow').innerHTML,/>Ultra</);
assert.equal((node('matrix').innerHTML.match(/scope="row"/g)||[]).length,2);
// The three newest comparable successful standard runs are 40, 40, 25; 429 and the ledger run are excluded.
assert.match(node('matrix').innerHTML,/35<\/strong><small class="sample-count">n=3/);
assert.match(node('matrix').innerHTML,/35<\/strong><small class="sample-count">n=1/);
assert.match(node('matrix').innerHTML,/Unsupported/);
assert.match(node('matrix').innerHTML,/90<\/strong><small class="sample-count">n=1/);
assert.equal(node('scatterEffort').textContent,'Low effort');
assert.equal(node('comboCount').textContent,6);
assert.match(node('modelGraph').innerHTML,/gpt-6-sol/);
assert.match(node('modelGraph').innerHTML,/Standard: 35 tokens per second/);
assert.match(node('modelGraph').innerHTML,/Fast: 35 tokens per second/);
assert.match(node('modelGraph').innerHTML,/n=3/);
assert.match(node('effortGraph').innerHTML,/Mean turn time \(seconds\)/);
assert.match(node('effortGraph').innerHTML,/gpt-6-sol · Fast · 3 s · 35 response tokens\/s · n=1/);
node('graphModel').value='missing'; node('graphModel').handlers.change();
assert.match(node('effortGraph').innerHTML,/No completed rates/);
node('graphEffort').value='high'; node('graphEffort').handlers.change();
assert.match(node('modelGraph').innerHTML,/No completed rates/);
assert.equal(node('scatterEffort').textContent,'High effort');
node('modelFilter').value='gpt-6-luna'; node('modelFilter').handlers.change();
assert.equal((node('matrix').innerHTML.match(/scope="row"/g)||[]).length,1);
node('effortFilter').value='low'; node('effortFilter').handlers.change();
assert.doesNotMatch(node('headRow').innerHTML,/>High</);
node('matrix').handlers.click({target:{closest:()=>({dataset:{model:'gpt-6-sol',effort:'low',speed:'standard'}})}});
assert.match(node('detailTags').textContent,/3 in average/);
assert.match(node('records').innerHTML,/429 · provider error/);
assert.equal((node('records').innerHTML.match(/In average ·/g)||[]).length,3);
assert.match(template,/@media\(prefers-color-scheme:dark\)/);
assert.match(template,/html,body\{margin:0;background:transparent/);
assert.match(template,/\.panel\{background:transparent/);
assert.ok(template.indexOf('<section class="graphs"') < template.indexOf('aria-labelledby="matrixTitle"'));
console.log('Graphs, last-three comparable means, failures, sample counts and details passed.');
