(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  let today = Vocab.date(), mode = 'today', words = [], queue = [], index = 0, timer, revealed = false, paused = false;
  let positions = {};
  const cancel = () => { clearTimeout(timer); timer = undefined; };
  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { $('status').textContent = '本地记录不可读取，本次仍可学习。'; return fallback; }
  }
  function save() {
    positions[`${today}:${mode}`] = index;
    try {
      localStorage.setItem('cet6.history.v1', JSON.stringify(words));
      localStorage.setItem('cet6.progress.v1', JSON.stringify(positions));
    } catch { $('status').textContent = '浏览器未能保存记录；关闭后可能丢失进度。'; }
  }
  function schedule() {
    cancel();
    if (revealed && !paused && !document.hidden) timer = setTimeout(next, 2000);
  }
  function render() {
    cancel(); revealed = false;
    const entry = queue[index];
    $('word').textContent = entry ? entry.word : queue.length ? '本轮完成' : '今日暂无新增';
    $('meaning').textContent = '';
    $('hint').textContent = entry ? '点击查看释义' : queue.length ? '今天的积累，已经记下。' : '可切换历史词库复习，等待追加新词。';
    $('card').disabled = !entry; $('next').disabled = !entry;
    $('progress').textContent = queue.length ? `${Math.min(index + 1, queue.length)} / ${queue.length} · ${mode === 'today' ? '今日学习' : '历史复习'}` : '0 / 0';
    $('restart').hidden = !queue.length || !!entry;
    $('today').setAttribute('aria-pressed', String(mode === 'today'));
    $('all').setAttribute('aria-pressed', String(mode === 'all'));
    $('stats').textContent = `今日新增 ${Vocab.select(words,'today',today).length} 词 · 累计 ${words.length} 词`;
    save();
  }
  function select(value) {
    mode = value; queue = Vocab.select(words,mode,today);
    const position = positions[`${today}:${mode}`];
    index = Number.isInteger(position) ? Math.max(0,Math.min(position,queue.length)) : 0;
    render();
  }
  function next() { if(index < queue.length) { index++; render(); } }
  function refresh() {
    today = Vocab.date();
    const stored = read('cet6.history.v1', []);
    words = Vocab.merge(Array.isArray(stored) ? stored : [], globalThis.WORD_BATCHES || [],today);
    const progress = read('cet6.progress.v1', {});
    positions = progress && typeof progress === 'object' && !Array.isArray(progress) ? progress : {};
    $('date').textContent = today;
    $('library').replaceChildren();
    words.forEach(entry => {
      const li = document.createElement('li'), meaning = document.createElement('span');
      li.textContent = entry.word; meaning.textContent = `${entry.meaning} · ${entry.date}`;
      li.append(meaning); $('library').append(li);
    });
    select(mode);
  }
  $('card').onclick = () => {
    if(revealed || !queue[index]) return;
    revealed = true; $('meaning').textContent = queue[index].meaning;
    $('hint').textContent = paused ? '自动切换已暂停' : '2 秒后进入下一个单词'; schedule();
  };
  $('next').onclick = next;
  $('today').onclick = () => select('today'); $('all').onclick = () => select('all');
  $('restart').onclick = () => { index = 0; render(); };
  $('pause').onclick = () => {
    paused = !paused; $('pause').textContent = paused ? '恢复自动切换' : '暂停自动切换';
    $('pause').setAttribute('aria-pressed',String(paused));
    if(revealed) $('hint').textContent = paused ? '自动切换已暂停' : '2 秒后进入下一个单词';
    schedule();
  };
  document.addEventListener('visibilitychange', () => {
    if(document.hidden) cancel(); else if(today !== Vocab.date()) refresh(); else schedule();
  });
  setInterval(() => { if(today !== Vocab.date()) refresh(); },30000);
  refresh();
})();
