(function (root) {
  'use strict';
  const key = word => word.trim().toLowerCase();
  root.Vocab = {
    date: () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    },
    merge(history, batches, today) {
      const map = new Map();
      const add = entry => {
        if (!entry || typeof entry.word !== 'string' || typeof entry.meaning !== 'string' || !entry.word.trim() || !entry.meaning.trim() || typeof entry.date !== 'string') return;
        if (entry.date <= today && !map.has(key(entry.word))) map.set(key(entry.word), {...entry,word:entry.word.trim()});
      };
      history.forEach(add);
      batches.slice().sort((a,b)=>a.date.localeCompare(b.date)).forEach(batch => {
        if (batch.date <= today) batch.words.forEach(word=>add({...word,date:batch.date}));
      });
      return [...map.values()];
    },
    select: (words, mode, today) => words.filter(word=> mode === 'all' || word.date === today)
  };
})(globalThis);
