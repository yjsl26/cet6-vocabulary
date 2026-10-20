const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
test('translation bank adds 20 unique topic entries per day and preserves all eight earlier words',()=>{
  const context={}; vm.createContext(context);
  for(const file of ['assets/core.js','data/words.js','data/translation.js']) {
    const full=path.join(__dirname,'..',file);
    if(fs.existsSync(full)) vm.runInContext(fs.readFileSync(full,'utf8'),context);
  }
  assert.ok(context.TRANSLATION_BATCHES,'translation vocabulary must exist');
  assert.equal(context.TRANSLATION_BATCHES.length,6);
  const entries=context.TRANSLATION_BATCHES.flatMap(batch=>batch.words);
  assert.equal(entries.length,120);
  assert.equal(new Set(entries.map(entry=>entry.word.toLowerCase())).size,120);
  for(const batch of context.TRANSLATION_BATCHES) {
    assert.equal(batch.words.length,20);
    for(const entry of batch.words) {
      assert.ok(entry.word.trim() && entry.meaning.trim() && entry.topic.trim());
    }
  }
  const initial=context.Vocab.merge([],context.WORD_BATCHES,'2026-10-20');
  const batches=[...context.WORD_BATCHES,...context.TRANSLATION_BATCHES];
  const day1=context.Vocab.merge(initial,batches,'2026-10-20');
  assert.equal(day1.length,28);
  assert.equal(context.Vocab.merge(day1,batches,'2026-10-21').length,48);
  assert.equal(context.Vocab.merge(day1,batches,'2026-10-25').length,128);
  assert.equal(context.Vocab.merge(day1,batches,'2026-10-25')[0].meaning,initial[0].meaning);
});
