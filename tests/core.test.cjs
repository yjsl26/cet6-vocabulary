const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context={}; vm.createContext(context);
const path=require('node:path').join(__dirname,'../assets/core.js');
if(fs.existsSync(path)) vm.runInContext(fs.readFileSync(path,'utf8'),context);
test('daily additions preserve old meanings, deduplicate, and exclude future batches',()=>{
  assert.ok(context.Vocab,'vocabulary engine must exist');
  const old=[{word:'retain',meaning:'保留',date:'2026-10-19'}];
  const batches=[{date:'2026-10-20',words:[{word:'retain',meaning:'覆盖'},{word:'adapt',meaning:'适应'}]},{date:'2099-01-01',words:[{word:'future',meaning:'未来'}]}];
  const result=context.Vocab.merge(old,batches,'2026-10-20');
  assert.equal(result.length,2); assert.equal(result[0].meaning,'保留');
  assert.equal(context.Vocab.select(result,'today','2026-10-20').length,1);
  assert.equal(context.Vocab.select(result,'all','2026-10-21').length,2);
});
