(() => {
  'use strict';
  const KEY = 'wutong-roommate-life-v1';
  const MEMBERS = [
    { id: 'm1', name: '小林', color: '#d9efe6', initial: '林' },
    { id: 'm2', name: '阿哲', color: '#e2e8f9', initial: '哲' },
    { id: 'm3', name: '小雨', color: '#ffe7d7', initial: '雨' },
    { id: 'm4', name: '可可', color: '#eee1f8', initial: '可' }
  ];
  const TITLES = {
    overview: ['一起住，把生活过好', '费用清楚，家务有序，属于我们的合租小日常。'],
    expenses: ['费用分摊', '每一笔都算清楚，让室友之间只留下好关系。'],
    chores: ['清洁值日', '共同的空间，一起照顾。今天也让家里轻松一点。'],
    supplies: ['公共物品', '消耗有记录，补货有提醒。刚好够用，不再临时找。'],
    agreement: ['室友公约', '把期待说清楚，让彼此都住得舒服。'],
    life: ['室友空间', '约定怎么一起住，也记录一起生活的小美好。']
  };
  const ACTION_LABELS = { overview: '记一笔费用', expenses: '新增费用', chores: '添加值日', supplies: '登记物品', agreement: '发起议题', life: '写下心意' };
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const member = id => MEMBERS.find(item => item.id === id) || MEMBERS[0];
  const money = cents => '¥' + (Number(cents || 0) / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const id = prefix => prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  const today = () => dateKey(new Date());
  function dateKey(value) {
    const d = value instanceof Date ? value : new Date(value + 'T12:00:00');
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function addDays(value, n) { const d = new Date(value + 'T12:00:00'); d.setDate(d.getDate() + n); return dateKey(d); }
  function monday(value) { const d = new Date(value + 'T12:00:00'); return addDays(value, -((d.getDay() + 6) % 7)); }
  function dateLabel(value) {
    const d = new Date(value + 'T12:00:00');
    return `${d.getMonth() + 1}月${d.getDate()}日 · 周${'日一二三四五六'[d.getDay()]}`;
  }
  function avatar(mid, size = '') { const m = member(mid); return `<span class="avatar ${size}" style="background:${m.color}">${m.initial}</span>`; }
  function badge(text, tone = '') { return `<span class="badge ${tone ? 'badge-' + tone : ''}">${esc(text)}</span>`; }
  function seed() {
    const now = today(); const week = monday(now);
    return {
      version: 1, currentMember: 'm1', generatedWeeks: [],
      bills: [
        { id: 'b-rent', title: '本月房租', category: '房租', cents: 760000, paidBy: 'm1', date: now.slice(0, 8) + '01', split: 'equal', shares: { m1: 190000, m2: 190000, m3: 190000, m4: 190000 }, note: '四人均分，每人 ¥1,900.00' },
        { id: 'b-electric', title: '水电燃气', category: '水电', cents: 23680, paidBy: 'm2', date: addDays(now, -2), split: 'equal', shares: { m1: 5920, m2: 5920, m3: 5920, m4: 5920 }, note: '公共费用，四人均分' },
        { id: 'b-supply', title: '洗衣液与抽纸', category: '日用', cents: 8850, paidBy: 'm3', date: addDays(now, -1), split: 'equal', shares: { m1: 2213, m2: 2213, m3: 2212, m4: 2212 }, note: '分钱尾差已自动处理' }
      ],
      settlements: [],
      chores: [
        { id: 'c-kitchen', title: '厨房清洁', area: '厨房', owner: 'm1', date: now, done: false },
        { id: 'c-living', title: '客厅吸尘', area: '客厅', owner: 'm2', date: addDays(now, 1), done: false },
        { id: 'c-bath', title: '浴室清洁', area: '浴室', owner: 'm3', date: addDays(now, 2), done: false },
        { id: 'c-trash', title: '垃圾分类与清运', area: '公共区域', owner: 'm4', date: addDays(week, 2), done: true }
      ],
      supplies: [
        { id: 's-laundry', name: '洗衣液', quantity: 1, threshold: 1, unit: '瓶', category: '清洁', note: '快用完了，补货时选无香型', updated: now },
        { id: 's-tissue', name: '抽纸', quantity: 5, threshold: 2, unit: '包', category: '日用', note: '放在客厅收纳柜', updated: now },
        { id: 's-bag', name: '垃圾袋', quantity: 0, threshold: 1, unit: '卷', category: '清洁', note: '45 × 50 cm，厨房用', updated: now },
        { id: 's-rice', name: '大米', quantity: 2, threshold: 1, unit: '袋', category: '厨房', note: '开封后记得封口', updated: now }
      ],
      clauses: [
        '晚上 23:00 后保持安静，使用耳机，不在公共区域大声通话。',
        '厨房使用后及时擦净台面、洗好餐具，垃圾满了顺手带走。',
        '公共费用及时登记，每月最后一天核对并结算。',
        '带朋友留宿提前在群里告知，尊重每位室友的私人空间。',
        '公共物品用完及时登记，个人物品使用前先征得同意。'
      ],
      issues: [{ id: 'i-quiet', title: '周末大扫除改到周日下午？', detail: '周六大家安排比较多，建议每周日下午一起整理公共区域，约 30 分钟。', author: 'm3', date: now, votes: { m3: 'agree', m4: 'agree' } }],
      activity: [{ id: 'a-seed', text: '小雨登记了洗衣液与抽纸费用', date: addDays(now, -1) }, { id: 'a-trash', text: '可可完成了垃圾分类与清运', date: now }]
    };
  }
  let state;
  try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); state = saved && saved.version === 1 && Array.isArray(saved.bills) ? saved : seed(); }
  catch (_) { state = seed(); }
  let view = TITLES[location.hash.slice(1)] ? location.hash.slice(1) : 'overview';
  let expenseFilter = 'all';
  let lastFocus = null;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (_) { toast('浏览器存储不可用，当前会话仍可体验。'); return false; } }
  function record(text) { state.activity.unshift({ id: id('a'), text, date: today() }); state.activity = state.activity.slice(0, 24); }
  function toast(text) {
    const el = document.getElementById('toast'); if (!el) return;
    el.textContent = text; el.classList.add('show'); el.dataset.visible = 'true';
    clearTimeout(toast.timer); toast.timer = setTimeout(() => { el.classList.remove('show'); el.dataset.visible = 'false'; }, 3200);
  }
  function balances() {
    const result = Object.fromEntries(MEMBERS.map(m => [m.id, 0]));
    state.bills.forEach(b => { result[b.paidBy] += b.cents; Object.entries(b.shares).forEach(([mid, cents]) => { result[mid] -= cents; }); });
    state.settlements.forEach(s => { result[s.from] += s.cents; result[s.to] -= s.cents; });
    return result;
  }
  function suggestions() {
    const b = balances(); const owes = MEMBERS.filter(m => b[m.id] < 0).map(m => ({ id: m.id, cents: -b[m.id] }));
    const gets = MEMBERS.filter(m => b[m.id] > 0).map(m => ({ id: m.id, cents: b[m.id] }));
    const result = []; let i = 0; let j = 0;
    while (i < owes.length && j < gets.length) { const amount = Math.min(owes[i].cents, gets[j].cents); if (amount) result.push({ from: owes[i].id, to: gets[j].id, cents: amount }); owes[i].cents -= amount; gets[j].cents -= amount; if (!owes[i].cents) i++; if (!gets[j].cents) j++; }
    return result;
  }
  function allocate(cents, weights) {
    const entries = Object.entries(weights); const total = entries.reduce((sum, entry) => sum + entry[1], 0);
    const pieces = entries.map(([mid, weight]) => ({ mid, raw: cents * weight / total, cents: Math.floor(cents * weight / total) }));
    let extra = cents - pieces.reduce((sum, item) => sum + item.cents, 0);
    [...pieces].sort((a, b) => (b.raw - b.cents) - (a.raw - a.cents) || a.mid.localeCompare(b.mid)).forEach(piece => { if (extra > 0) { piece.cents++; extra--; } });
    return Object.fromEntries(pieces.map(piece => [piece.mid, piece.cents]));
  }
  function stats() { const month = today().slice(0, 7); return { monthBills: state.bills.filter(b => b.date.startsWith(month)), pending: state.chores.filter(c => !c.done), low: state.supplies.filter(s => s.quantity <= s.threshold) }; }
  function header(title, subtitle, extra = '') { return `<div class="card-header"><div><h2 class="card-title">${esc(title)}</h2>${subtitle ? `<p class="muted">${esc(subtitle)}</p>` : ''}</div>${extra}</div>`; }
  function overviewPage() {
    const s = stats(); const b = balances(); const me = state.currentMember;
    const mine = s.pending.filter(c => c.owner === me).sort((a, b) => a.date.localeCompare(b.date));
    const monthTotal = s.monthBills.reduce((sum, bill) => sum + bill.cents, 0);
    return `<div class="welcome-banner"><div><span class="section-label">梧桐里 · 302 / OUR HOME</span><h2>把琐事安排好，<br>留更多时间给生活。</h2><p>四位室友，一个舒服的家。今天的共同生活，从这里开始。</p><div class="banner-members">${MEMBERS.map(m => avatar(m.id)).join('')}<span>4 位室友一起生活</span></div></div><div class="house-illustration" aria-hidden="true"><span class="house-roof"></span><span class="house-body"><span class="house-window"></span><span class="house-door"></span></span><span class="house-plant">✿</span><span class="house-spark">✦</span></div></div>
      <div class="metrics-grid"><div class="card metric"><span class="metric-icon">¥</span><span class="metric-label">本月公共支出</span><strong class="metric-value">${money(monthTotal)}</strong><span class="muted">${s.monthBills.length} 笔已登记费用</span></div><div class="card metric"><span class="metric-icon">↗</span><span class="metric-label">我的待结算</span><strong class="metric-value">${money(Math.abs(b[me]))}</strong><span class="muted">${b[me] > 0 ? '待室友转入' : b[me] < 0 ? '待转给室友' : '已全部结清'}</span></div><div class="card metric"><span class="metric-icon">✓</span><span class="metric-label">我的待办家务</span><strong class="metric-value">${mine.length}<small> 项</small></strong><span class="muted">${mine[0] ? '下次：' + dateLabel(mine[0].date) : '今天可以放松一下'}</span></div><div class="card metric"><span class="metric-icon">▦</span><span class="metric-label">需要补货</span><strong class="metric-value">${s.low.length}<small> 件</small></strong><span class="muted">${s.low.length ? '一起添置，让家里不断供' : '物品充足，生活安心'}</span></div></div>
      <div class="page-grid overview-grid"><section class="card">${header('近期值日', '小小的分工，让家更舒服', '<button class="btn btn-ghost" data-view="chores">查看全部 ↗</button>')}<div class="list">${s.pending.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4).map(choreRow).join('') || '<div class="empty-state">所有家务都完成了，辛苦大家！</div>'}</div></section><section class="card">${header('补货提醒', '用完之前，先提醒一下', badge(`${s.low.length} 件待补货`, 'orange'))}<div class="list">${s.low.map(supplyCompact).join('') || '<div class="empty-state">公共物品库存充足。</div>'}</div><button class="btn btn-secondary full-width" data-view="supplies">管理公共物品</button></section><section class="card">${header('家的动态', '每一份付出，都有记录')}<div class="activity-list">${state.activity.slice(0, 5).map(a => `<div class="activity-item"><span class="activity-dot"></span><div><p>${esc(a.text)}</p><span class="muted">${dateLabel(a.date)}</span></div></div>`).join('')}</div></section><section class="card agreement-preview">${header('我们的默契', '共识让共同生活更简单', badge('室友公约', 'green'))}<blockquote>“${esc(state.clauses[0] || '一起约定，一起维护一个舒服的家。')}”</blockquote><p class="muted">已有 ${state.clauses.length} 条生活约定 · ${state.issues.filter(i => Object.values(i.votes).filter(v => v === 'agree').length < MEMBERS.length).length} 个议题讨论中</p><button class="btn btn-secondary full-width" data-view="agreement">看看我们的公约 →</button></section></div>`;
  }
  function choreRow(c) {
    const overdue = !c.done && c.date < today();
    return `<div class="row chore-row"><button class="task-check ${c.done ? 'checked' : ''}" data-action="toggle-chore" data-id="${esc(c.id)}" aria-label="${c.done ? '撤销完成' : '完成'}：${esc(c.title)}">${c.done ? '✓' : ''}</button><div class="row-body"><strong class="${c.done ? 'strikethrough' : ''}">${esc(c.title)}</strong><p class="muted">${dateLabel(c.date)}${overdue ? ' · 已逾期' : c.date === today() && !c.done ? ' · 今天' : ''}</p></div><div class="owner-chip">${avatar(c.owner)}<span>${esc(member(c.owner).name)}</span></div></div>`;
  }
  function supplyCompact(s) { return `<div class="row"><span class="supply-icon">${s.category === '厨房' ? '◉' : s.category === '清洁' ? '✧' : '▤'}</span><div class="row-body"><strong>${esc(s.name)}</strong><p class="muted">剩余 ${s.quantity} ${esc(s.unit)} · 提醒线 ${s.threshold} ${esc(s.unit)}</p></div><button class="btn btn-ghost" data-action="restock" data-id="${esc(s.id)}">补货 +</button></div>`; }
  function expensesPage() {
    const b = balances(); const ss = suggestions();
    const currentMonth = today().slice(0, 7); const bills = state.bills.filter(item => expenseFilter === 'all' || item.date.startsWith(currentMonth)).slice().sort((a, b) => b.date.localeCompare(a.date));
    return `<div class="page-grid expenses-top"><section class="card">${header('室友结算', '正数为待收款，负数为待付款；所有金额精确到分。', badge(ss.length ? `${ss.length} 笔待转账` : '已结清', ss.length ? 'orange' : 'green'))}<div class="balance-grid">${MEMBERS.map(m => `<div class="balance-item">${avatar(m.id)}<strong>${m.name}</strong><span class="balance-amount ${b[m.id] < 0 ? 'negative' : 'positive'}">${b[m.id] > 0 ? '+' : b[m.id] < 0 ? '−' : ''}${money(Math.abs(b[m.id]))}</span><span class="muted">${b[m.id] > 0 ? '应收' : b[m.id] < 0 ? '应付' : '已结清'}</span></div>`).join('')}</div><div class="settlement-list">${ss.map(s => `<div class="row"><div class="row-body"><strong>${member(s.from).name} <span class="muted">→</span> ${member(s.to).name}</strong><p class="muted">一笔转账，结清多笔费用</p></div><strong>${money(s.cents)}</strong><button class="btn btn-secondary" data-action="settle" data-from="${s.from}" data-to="${s.to}" data-cents="${s.cents}">确认已转账</button></div>`).join('') || '<div class="empty-state">✓ 公共费用已全部结清，账目清清楚楚。</div>'}</div><p class="small muted">此处记录线下转账结果，不会发起真实支付。确认前请双方核对到账。</p></section><section class="card expenses-note">${header('本月账单', '看得见的支出，分得清的责任')}<strong class="large-total">${money(stats().monthBills.reduce((n, bill) => n + bill.cents, 0))}</strong><p class="muted">共 ${stats().monthBills.length} 笔公共费用</p><div class="category-summary">${['房租', '水电', '日用', '其他'].map(cat => { const n = stats().monthBills.filter(bill => bill.category === cat).reduce((sum, bill) => sum + bill.cents, 0); return `<div class="row"><span>${cat}</span><strong>${money(n)}</strong></div>`; }).join('')}</div></section></div>
      <section class="card">${header('费用明细', '支持均分与按权重分摊，付款人也可不参与分摊。', '<div class="segmented"><button data-action="expense-filter" data-filter="all" class="' + (expenseFilter === 'all' ? 'active' : '') + '">全部</button><button data-action="expense-filter" data-filter="month" class="' + (expenseFilter === 'month' ? 'active' : '') + '">本月</button></div>')}<div class="table-wrap"><table class="data-table"><thead><tr><th>费用</th><th>金额</th><th>付款人</th><th>分摊明细</th><th>日期</th></tr></thead><tbody>${bills.map(bill => `<tr><td><strong>${esc(bill.title)}</strong><div class="muted">${esc(bill.category)}${bill.note ? ' · ' + esc(bill.note) : ''}</div></td><td><strong>${money(bill.cents)}</strong></td><td><span class="owner-chip">${avatar(bill.paidBy)}${member(bill.paidBy).name}</span></td><td><div class="share-detail">${Object.entries(bill.shares).map(([mid, cents]) => `<span>${member(mid).name} ${money(cents)}</span>`).join('')}</div></td><td>${esc(bill.date)}</td></tr>`).join('') || '<tr><td colspan="5" class="empty-state">还没有费用，记下第一笔吧。</td></tr>'}</tbody></table></div></section>
      ${state.settlements.length ? `<section class="card">${header('转账记录', '已确认的记录会自动抵扣待结算金额。')}<div class="list">${state.settlements.slice().reverse().map(s => `<div class="row"><span class="settled-icon">✓</span><div class="row-body"><strong>${member(s.from).name} → ${member(s.to).name}</strong><p class="muted">${esc(s.date)} · 已确认线下转账</p></div><strong>${money(s.cents)}</strong><button class="btn btn-ghost" data-action="undo-settlement" data-id="${esc(s.id)}">撤销</button></div>`).join('')}</div></section>` : ''}`;
  }
  function choresPage() {
    const pending = state.chores.filter(c => !c.done).sort((a, b) => a.date.localeCompare(b.date)); const done = state.chores.filter(c => c.done).sort((a, b) => b.date.localeCompare(a.date));
    const total = state.chores.length; const progress = total ? Math.round(done.length / total * 100) : 0;
    return `<div class="chore-summary card"><div><span class="section-label">共同维护 / SHARED CARE</span><h2>一个人的小事，四个人的好生活。</h2><p class="muted">已完成 ${done.length} 项，仍有 ${pending.length} 项待办。点击圆圈即可完成或撤销。</p></div><div class="progress-summary"><strong>${progress}%</strong><div class="progress"><span class="bar" style="width:${progress}%"></span></div><span class="muted">全部已登记任务完成率</span></div><button class="btn btn-secondary" data-action="generate-week">生成下一周轮值 ↻</button></div><div class="page-grid chores-grid">${MEMBERS.map(m => { const tasks = pending.filter(c => c.owner === m.id); return `<section class="card">${header(m.name + '的值日', tasks.length + ' 项待办', avatar(m.id))}<div class="list">${tasks.map(c => `<div class="task-card">${choreRow(c)}<div class="task-card-footer"><span class="muted">${esc(c.area)}</span><button class="btn btn-ghost" data-action="edit-chore" data-id="${esc(c.id)}">调整安排</button></div></div>`).join('') || '<div class="empty-state">✦ 暂无待办，享受轻松时光。</div>'}</div></section>`; }).join('')}</div><section class="card">${header('已完成', '谢谢每一个让家变好的小行动', badge(`${done.length} 项`, 'green'))}<div class="list">${done.map(choreRow).join('') || '<div class="empty-state">完成的值日会出现在这里。</div>'}</div></section>`;
  }
  function suppliesPage() {
    const low = stats().low;
    return `<div class="info-banner ${low.length ? 'warning-banner' : ''}"><span class="info-icon">${low.length ? '!' : '✓'}</span><div><strong>${low.length ? `有 ${low.length} 件公共物品需要补货` : '公共物品库存充足'}</strong><p>${low.length ? low.map(s => esc(s.name)).join('、') + '已达到提醒线，记得下次采购时带上。' : '每次使用后记录消耗，大家都能知道还剩多少。'}</p></div><button class="btn btn-secondary" data-action="new-supply">登记物品</button></div><div class="supplies-grid">${state.supplies.map(s => { const isLow = s.quantity <= s.threshold; return `<section class="card supply-card"><div class="supply-card-top"><span class="supply-icon large">${s.category === '厨房' ? '◉' : s.category === '清洁' ? '✧' : '▤'}</span>${badge(s.quantity === 0 ? '已用完' : isLow ? '需要补货' : '库存充足', s.quantity === 0 ? 'red' : isLow ? 'orange' : 'green')}</div><h2>${esc(s.name)}</h2><p class="muted">${esc(s.category)} · ${esc(s.note || '公共物品，一起维护')}</p><div class="stock-number">${s.quantity}<small>${esc(s.unit)}</small></div><p class="muted">低于或等于 ${s.threshold} ${esc(s.unit)}时提醒</p><div class="supply-actions"><button class="btn btn-secondary" data-action="consume" data-id="${esc(s.id)}" ${s.quantity === 0 ? 'disabled' : ''}>消耗 −</button><button class="btn btn-primary" data-action="restock" data-id="${esc(s.id)}">补货 +</button></div><div class="supply-card-footer"><span class="muted">更新于 ${esc(s.updated)}</span><button class="btn btn-ghost" data-action="edit-supply" data-id="${esc(s.id)}">编辑</button></div></section>`; }).join('') || '<section class="card empty-state">还没有公共物品，点击登记开始记录。</section>'}</div><p class="small muted">提醒显示在首页与物品页；当前雏形暂不发送短信或外部推送。</p>`;
  }
  function agreementPage() {
    return `<div class="page-grid agreement-grid"><section class="card agreement-card">${header('我们的生活公约', '共同的家，共同的约定。', '<button class="btn btn-secondary" data-action="edit-agreement">编辑公约</button>')}<div class="clauses-list">${state.clauses.map((clause, i) => `<div class="clause"><span class="clause-number">${String(i + 1).padStart(2, '0')}</span><p>${esc(clause)}</p></div>`).join('') || '<div class="empty-state">写下第一条共同约定。</div>'}</div><div class="agreement-footnote">✦ 有新想法？先发起议题，等大家达成共识再更新公约。</div></section><section class="card">${header('室友议事厅', '每个人的意见都值得被听见。', badge(`${state.issues.length} 个议题`))}<div class="issues-list">${state.issues.map(issue => { const votes = Object.values(issue.votes); const agree = votes.filter(v => v === 'agree').length; const reject = votes.filter(v => v === 'reject').length; const mine = issue.votes[state.currentMember]; return `<article class="issue"><div class="issue-status">${badge(agree === MEMBERS.length ? '已达成共识' : reject ? '继续讨论' : '征求意见中', agree === MEMBERS.length ? 'green' : 'orange')}<span class="muted">${esc(issue.date)}</span></div><h3>${esc(issue.title)}</h3><p>${esc(issue.detail)}</p><div class="vote-members">${MEMBERS.map(m => `<span class="vote-member" title="${m.name}：${issue.votes[m.id] === 'agree' ? '同意' : issue.votes[m.id] === 'reject' ? '不同意' : '未表态'}">${avatar(m.id)}<i class="${issue.votes[m.id] || ''}">${issue.votes[m.id] === 'agree' ? '✓' : issue.votes[m.id] === 'reject' ? '−' : '·'}</i></span>`).join('')}<span class="muted">${agree} 同意 · ${reject} 不同意</span></div><div class="issue-actions"><button class="btn ${mine === 'agree' ? 'btn-primary' : 'btn-secondary'}" data-action="vote" data-id="${esc(issue.id)}" data-vote="agree">${mine === 'agree' ? '✓ 已同意' : '同意'}</button><button class="btn ${mine === 'reject' ? 'btn-primary' : 'btn-secondary'}" data-action="vote" data-id="${esc(issue.id)}" data-vote="reject">${mine === 'reject' ? '已不同意' : '不同意'}</button>${mine ? `<button class="btn btn-ghost" data-action="vote" data-id="${esc(issue.id)}" data-vote="clear">撤回</button>` : ''}</div><p class="small muted">${member(issue.author).name} 发起 · 当前以${member(state.currentMember).name}身份表态</p></article>`; }).join('') || '<div class="empty-state">暂无议题，分享一个让家更好的想法吧。</div>'}</div></section></div><div class="demo-panel"><div><strong>这是一个可以动手体验的合租雏形</strong><p class="muted">数据仅保存在当前浏览器；切换右上角室友可体验表态与个人待办。多人实时同步可在后续迭代接入。</p></div><button class="btn btn-secondary" data-action="reset">重置演示数据</button></div>`;
  }
  function render() {
    const el = document.getElementById('main-content'); if (!el) return;
    const [title, subtitle] = TITLES[view]; document.getElementById('page-title').textContent = title;
    const sub = document.getElementById('page-subtitle'); if (sub) sub.textContent = subtitle;
    const action = document.getElementById('primary-action'); if (action) action.textContent = '+ ' + (view === 'life' && window.RoommateLife ? window.RoommateLife.getPrimaryLabel() : ACTION_LABELS[view]);
    document.querySelectorAll('[data-view]').forEach(button => { const active = button.dataset.view === view; button.classList.toggle('active', active); if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current'); });
    el.innerHTML = ({ overview: overviewPage, expenses: expensesPage, chores: choresPage, supplies: suppliesPage, agreement: agreementPage, life: () => window.RoommateLife ? window.RoommateLife.render() : '<div class="card">正在整理生活乐趣…</div>' })[view]();
    if (view === 'overview') el.insertAdjacentHTML('beforeend', '<section class="card life-home-entry"><div><span class="section-label">不止一起住 / LITTLE JOYS</span><h2>把室友，慢慢变成朋友。</h2><p class="muted">一封心意留言、一场秘密惊喜、一面照片墙，还有每周值得期待的电影夜。</p></div><button class="btn btn-primary" data-view="life">去发现生活乐趣 →</button></section>');
    const select = document.getElementById('member-switch'); if (select) select.value = state.currentMember;
    document.querySelectorAll('[data-view]').forEach(button => { const active = button.dataset.view === view; button.classList.toggle('active', active); if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current'); });
  }
  function navigate(next) { if (next === 'agreement') { if (window.RoommateLife) window.RoommateLife.selectTab('agreement', false); next = 'life'; } if (!TITLES[next]) return; view = next; history.replaceState(null, '', '#' + next); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function closeModal() { const root = document.getElementById('modal-root'); if (!root) return; const dialog = root.querySelector('dialog'); if (dialog && dialog.open) dialog.close(); root.innerHTML = ''; if (lastFocus && lastFocus.isConnected) lastFocus.focus(); }
  function modal(title, body, formId, submitText = '保存', subtitle = '') {
    const root = document.getElementById('modal-root'); if (!root) return;
    lastFocus = document.activeElement;
    root.innerHTML = `<dialog class="app-dialog"><div class="modal-header"><div><h2>${esc(title)}</h2>${subtitle ? `<p class="muted">${esc(subtitle)}</p>` : ''}</div><button type="button" class="modal-close" data-action="close-modal" aria-label="关闭">×</button></div><form id="${formId}"><div class="modal-body">${body}<p class="form-error" role="alert"></p></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-action="close-modal">取消</button><button type="submit" class="btn btn-primary">${esc(submitText)}</button></div></form></dialog>`;
    const dialog = root.querySelector('dialog'); dialog.showModal(); dialog.addEventListener('click', e => { if (e.target === dialog) { const rect = dialog.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) closeModal(); } }); dialog.addEventListener('cancel', e => { e.preventDefault(); closeModal(); });
  }
  function memberOptions(selected) { return MEMBERS.map(m => `<option value="${m.id}" ${m.id === selected ? 'selected' : ''}>${m.name}</option>`).join(''); }
  function newExpense() {
    modal('记一笔公共费用', `<div class="form-grid"><label class="field full-width">费用名称<input name="title" placeholder="例如：本月房租、周末采购" required maxlength="50"></label><label class="field">总金额（元）<input name="amount" type="number" min="0.01" max="1000000" step="0.01" placeholder="0.00" required></label><label class="field">费用类别<select name="category"><option>房租</option><option>水电</option><option selected>日用</option><option>其他</option></select></label><label class="field">付款人<select name="paidBy">${memberOptions(state.currentMember)}</select></label><label class="field">日期<input name="date" type="date" value="${today()}" required></label><label class="field full-width">分摊方式<select name="split"><option value="equal">平均分摊</option><option value="weighted">按权重分摊（例如 2 : 1 : 1 : 1）</option></select></label><fieldset class="participant-field full-width"><legend>参与分摊的室友</legend>${MEMBERS.map(m => `<div class="participant-row"><label><input type="checkbox" name="participant" value="${m.id}" checked>${m.name}</label><label class="weight-input">权重<input name="weight-${m.id}" type="number" min="1" max="1000" value="1" step="1" aria-label="${m.name}的分摊权重"></label><span data-share="${m.id}" class="muted">—</span></div>`).join('')}</fieldset><label class="field full-width">备注（可选）<input name="note" maxlength="100" placeholder="让大家知道这笔钱用在哪里"></label></div><p class="small muted">会自动分配到分，尾差优先分给小数余数较大的参与者。</p>`, 'expense-form', '保存费用');
    const form = document.getElementById('expense-form'); form.addEventListener('input', sharePreview); form.addEventListener('change', sharePreview); sharePreview();
  }
  function sharePreview() {
    const form = document.getElementById('expense-form'); if (!form) return; const data = new FormData(form); const cents = Math.round(Number(data.get('amount')) * 100); const people = data.getAll('participant'); const weighted = data.get('split') === 'weighted'; const weights = Object.fromEntries(people.map(mid => [mid, weighted ? Number(form.elements.namedItem('weight-' + mid).value) || 1 : 1]));
    const shares = people.length && cents > 0 ? allocate(cents, weights) : {};
    MEMBERS.forEach(m => { form.querySelector(`[data-share="${m.id}"]`).textContent = Object.hasOwn(shares, m.id) ? money(shares[m.id]) : people.includes(m.id) ? '金额待填' : '不参与'; form.querySelector(`[name="weight-${m.id}"]`).disabled = !weighted || !people.includes(m.id); });
  }
  function choreModal(chore) {
    modal(chore ? '调整值日安排' : '添加清洁值日', `<input type="hidden" name="id" value="${esc(chore ? chore.id : '')}"><div class="form-grid"><label class="field full-width">任务名称<input name="title" value="${esc(chore ? chore.title : '')}" required maxlength="50" placeholder="例如：厨房台面清洁"></label><label class="field">公共区域<select name="area">${['厨房', '客厅', '浴室', '公共区域', '其他'].map(area => `<option ${chore && chore.area === area ? 'selected' : ''}>${area}</option>`).join('')}</select></label><label class="field">负责人<select name="owner">${memberOptions(chore ? chore.owner : state.currentMember)}</select></label><label class="field full-width">值日日期<input name="date" type="date" value="${esc(chore ? chore.date : today())}" required></label></div>`, 'chore-form', '保存安排');
  }
  function supplyModal(s) {
    modal(s ? '编辑公共物品' : '登记公共物品', `<input type="hidden" name="id" value="${esc(s ? s.id : '')}"><div class="form-grid"><label class="field full-width">物品名称<input name="name" required maxlength="40" value="${esc(s ? s.name : '')}" placeholder="例如：洗衣液"></label><label class="field">类别<select name="category">${['日用', '清洁', '厨房', '其他'].map(c => `<option ${s && s.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label><label class="field">数量单位<input name="unit" required maxlength="10" value="${esc(s ? s.unit : '件')}" placeholder="瓶、包、卷"></label><label class="field">当前数量<input name="quantity" type="number" min="0" max="9999" step="1" value="${s ? s.quantity : 1}" required></label><label class="field">补货提醒线<input name="threshold" type="number" min="0" max="9999" step="1" value="${s ? s.threshold : 1}" required></label><label class="field full-width">备注<input name="note" maxlength="100" value="${esc(s ? s.note : '')}" placeholder="规格、存放位置或采购偏好"></label></div>`, 'supply-form', '保存物品', '数量达到或低于提醒线时，首页会显示补货提醒。');
  }
  function stockModal(s, type) {
    modal(type === 'consume' ? '记录物品消耗' : '登记补货', `<input type="hidden" name="id" value="${esc(s.id)}"><input type="hidden" name="type" value="${type}"><p><strong>${esc(s.name)}</strong> · 当前 ${s.quantity} ${esc(s.unit)}</p><label class="field">${type === 'consume' ? '消耗' : '补货'}数量（${esc(s.unit)}）<input name="amount" type="number" min="1" max="${type === 'consume' ? s.quantity : 9999 - s.quantity}" step="1" value="1" required></label>`, 'stock-form', '确认' + (type === 'consume' ? '消耗' : '补货'));
  }
  function newIssue() { modal('发起一个室友议题', '<label class="field">议题标题<input name="title" required maxlength="60" placeholder="例如：要不要添一台空气炸锅？"></label><label class="field">说明与建议<textarea name="detail" required maxlength="500" rows="4" placeholder="写清楚你的想法，邀请大家一起讨论。"></textarea></label>', 'issue-form', '发起讨论', '发起后，各位室友可同意、不同意或撤回自己的表态。'); }
  function error(form, text) { const target = form.querySelector('.form-error'); if (target) target.textContent = text; }
  function finish(text) { save(); closeModal(); render(); toast(text); }
  function validDate(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(new Date(value + 'T12:00:00').getTime()); }
  function submit(e) {
    const form = e.target; if (!form.id.endsWith('-form')) return; e.preventDefault(); const data = new FormData(form);
    if (form.id === 'expense-form') {
      const title = String(data.get('title') || '').trim(); const amount = Number(data.get('amount')); const cents = Math.round(amount * 100); const people = data.getAll('participant'); const weighted = data.get('split') === 'weighted';
      if (!title || !Number.isFinite(amount) || cents <= 0 || cents > 100000000 || !people.length || !validDate(String(data.get('date')))) return error(form, '请填写有效名称、金额、日期，并至少选择一位分摊室友。');
      const weights = Object.fromEntries(people.map(mid => [mid, weighted ? Number(data.get('weight-' + mid)) : 1]));
      if (Object.values(weights).some(w => !Number.isInteger(w) || w < 1 || w > 1000)) return error(form, '分摊权重请填写 1—1000 的整数。');
      state.bills.push({ id: id('b'), title, category: String(data.get('category')), cents, paidBy: String(data.get('paidBy')), date: String(data.get('date')), split: String(data.get('split')), shares: allocate(cents, weights), note: String(data.get('note') || '').trim() }); record(`${member(state.currentMember).name}登记了「${title}」${money(cents)}`); finish('费用已记录，分摊余额已更新。');
    } else if (form.id === 'chore-form') {
      const title = String(data.get('title') || '').trim(); const date = String(data.get('date')); if (!title || !validDate(date)) return error(form, '请填写任务名称与有效日期。');
      const existing = state.chores.find(c => c.id === data.get('id')); const value = { title, area: String(data.get('area')), owner: String(data.get('owner')), date };
      if (existing) Object.assign(existing, value); else state.chores.push({ id: id('c'), done: false, ...value }); record(`${member(state.currentMember).name}${existing ? '调整' : '添加'}了「${title}」值日`); finish('值日安排已保存。');
    } else if (form.id === 'supply-form') {
      const name = String(data.get('name') || '').trim(); const unit = String(data.get('unit') || '').trim(); const quantity = Number(data.get('quantity')); const threshold = Number(data.get('threshold'));
      if (!name || !unit || !Number.isInteger(quantity) || !Number.isInteger(threshold) || quantity < 0 || quantity > 9999 || threshold < 0 || threshold > 9999) return error(form, '请填写名称、单位与 0—9999 的整数数量。');
      const existing = state.supplies.find(s => s.id === data.get('id')); const value = { name, unit, quantity, threshold, category: String(data.get('category')), note: String(data.get('note') || '').trim(), updated: today() };
      if (existing) Object.assign(existing, value); else state.supplies.push({ id: id('s'), ...value }); record(`${member(state.currentMember).name}${existing ? '更新' : '登记'}了「${name}」库存`); finish('物品库存已保存。');
    } else if (form.id === 'stock-form') {
      const s = state.supplies.find(item => item.id === data.get('id')); const amount = Number(data.get('amount')); const consuming = data.get('type') === 'consume';
      if (!s || !Number.isInteger(amount) || amount <= 0 || (consuming ? amount > s.quantity : amount + s.quantity > 9999)) return error(form, '请输入有效整数数量，消耗不能超过当前库存。');
      s.quantity += consuming ? -amount : amount; s.updated = today(); record(`${member(state.currentMember).name}${consuming ? '消耗' : '补货'}了 ${amount}${s.unit}「${s.name}」`); finish(consuming ? '消耗已记录。' : '补货已记录，谢谢你照顾这个家。');
    } else if (form.id === 'issue-form') {
      const title = String(data.get('title') || '').trim(); const detail = String(data.get('detail') || '').trim(); if (!title || !detail) return error(form, '请填写议题标题与说明。');
      state.issues.unshift({ id: id('i'), title, detail, author: state.currentMember, date: today(), votes: { [state.currentMember]: 'agree' } }); record(`${member(state.currentMember).name}发起议题「${title}」`); finish('议题已发起，你已默认表态同意。');
    } else if (form.id === 'agreement-form') {
      const clauses = String(data.get('clauses') || '').split('\n').map(x => x.trim()).filter(Boolean); if (!clauses.length) return error(form, '请至少保留一条生活公约。');
      state.clauses = clauses; record(`${member(state.currentMember).name}更新了室友公约`); finish('公约已更新，记得与室友沟通。');
    } else if (form.id === 'settle-form') {
      const from = String(data.get('from')); const to = String(data.get('to')); const cents = Number(data.get('cents')); const suggestion = suggestions().find(s => s.from === from && s.to === to && s.cents === cents);
      if (!suggestion) return error(form, '这笔结算已更新或已记录，请关闭后重新核对。');
      state.settlements.push({ id: id('settle'), from, to, cents, date: today() }); record(`${member(from).name}已向${member(to).name}转账 ${money(cents)}`); finish('转账已记录，待结算金额已抵扣。');
    } else if (form.id === 'reset-form') { state = seed(); if (window.RoommateLife) window.RoommateLife.reset(); save(); closeModal(); render(); toast('已恢复演示数据。'); }
    else if (form.id === 'undo-form') { const sid = String(data.get('id')); const settlement = state.settlements.find(s => s.id === sid); if (!settlement) return error(form, '该记录已撤销。'); state.settlements = state.settlements.filter(s => s.id !== sid); record(`${member(state.currentMember).name}撤销了一笔 ${money(settlement.cents)} 的转账记录`); finish('记录已撤销，相应待结算金额已恢复。'); }
  }
  function generateWeek() {
    const start = addDays(monday(today()), 7); if (state.generatedWeeks.includes(start)) return toast('下一周轮值已生成，不会重复添加。');
    const templates = [{ title: '厨房清洁', area: '厨房', day: 0 }, { title: '客厅吸尘', area: '客厅', day: 2 }, { title: '浴室清洁', area: '浴室', day: 4 }, { title: '垃圾分类与清运', area: '公共区域', day: 6 }];
    const offset = (Math.floor((new Date(start + 'T12:00:00') - new Date('2024-01-01T12:00:00')) / (7 * 86400000)) % MEMBERS.length + MEMBERS.length) % MEMBERS.length;
    let added = 0; templates.forEach((t, i) => { const date = addDays(start, t.day); if (!state.chores.some(c => c.title === t.title && c.date === date)) { state.chores.push({ id: id('c'), title: t.title, area: t.area, owner: MEMBERS[(i + offset) % MEMBERS.length].id, date, done: false }); added++; } });
    state.generatedWeeks.push(start); record(`下一周轮值已生成，新增 ${added} 项任务`); save(); render(); toast(`已生成 ${start} 起的轮值，负责人每周轮换。`);
  }
  function click(e) {
    const button = e.target.closest('button'); if (!button || button.disabled) return;
    if (button.dataset.view) return navigate(button.dataset.view);
    if (button.id === 'primary-action') return ({ overview: newExpense, expenses: newExpense, chores: () => choreModal(), supplies: () => supplyModal(), agreement: newIssue, life: () => window.RoommateLife && window.RoommateLife.primaryAction() })[view]();
    const action = button.dataset.action; const targetId = button.dataset.id;
    if (action === 'close-modal') closeModal();
    else if (action === 'new-supply') supplyModal();
    else if (action === 'toggle-chore') { const c = state.chores.find(c => c.id === targetId); if (!c) return; c.done = !c.done; record(`${member(state.currentMember).name}${c.done ? '完成' : '撤销完成'}了「${c.title}」`); save(); render(); toast(c.done ? '完成啦，谢谢你的付出！' : '已恢复为待办。'); }
    else if (action === 'edit-chore') choreModal(state.chores.find(c => c.id === targetId));
    else if (action === 'generate-week') generateWeek();
    else if (action === 'edit-supply') supplyModal(state.supplies.find(s => s.id === targetId));
    else if (action === 'consume' || action === 'restock') { const s = state.supplies.find(s => s.id === targetId); if (s) stockModal(s, action); }
    else if (action === 'expense-filter') { expenseFilter = button.dataset.filter; render(); }
    else if (action === 'vote') { const issue = state.issues.find(i => i.id === targetId); if (!issue) return; if (button.dataset.vote === 'clear') delete issue.votes[state.currentMember]; else issue.votes[state.currentMember] = button.dataset.vote; save(); render(); toast(button.dataset.vote === 'clear' ? '已撤回表态。' : '你的意见已记录。'); }
    else if (action === 'edit-agreement') modal('编辑室友公约', `<label class="field">每行一条约定<textarea name="clauses" rows="9" required maxlength="3000">${esc(state.clauses.join('\n'))}</textarea></label><p class="small muted">建议先在议事厅取得共识，再更新正式公约。</p>`, 'agreement-form', '保存公约');
    else if (action === 'settle') { const s = suggestions().find(s => s.from === button.dataset.from && s.to === button.dataset.to && s.cents === Number(button.dataset.cents)); if (!s) return toast('结算信息已更新，请重新核对。'); modal('确认线下转账', `<input type="hidden" name="from" value="${s.from}"><input type="hidden" name="to" value="${s.to}"><input type="hidden" name="cents" value="${s.cents}"><div class="settle-confirm"><strong>${member(s.from).name} → ${member(s.to).name}</strong><span>${money(s.cents)}</span></div><p class="muted">请确认双方已经核对实际到账。此操作仅记账，不会发起真实支付；记录后金额自动抵扣，也可撤销。</p>`, 'settle-form', '已转账，记录结算'); }
    else if (action === 'undo-settlement') modal('撤销转账记录', `<input type="hidden" name="id" value="${esc(targetId)}"><p>撤销后，这笔金额会恢复到待结算余额。确认仅用于修正误记的记录。</p>`, 'undo-form', '确认撤销');
    else if (action === 'reset') modal('重置演示数据', '<p>你在当前浏览器新增的费用、家务、物品、公约与议题，以及心意留言、惊喜计划、上传照片、大事记和电影夜记录都将被清除，并恢复初始演示内容。</p>', 'reset-form', '确认重置');
  }
  function init() {
    if (view === 'agreement') { if (window.RoommateLife) window.RoommateLife.selectTab('agreement', false); view = 'life'; history.replaceState(null, '', '#life'); }
    const select = document.getElementById('member-switch');
    if (select) { select.innerHTML = memberOptions(state.currentMember); select.addEventListener('change', () => { if (MEMBERS.some(m => m.id === select.value)) { state.currentMember = select.value; save(); render(); toast('当前以' + member(state.currentMember).name + '的身份查看。'); } }); }
    document.addEventListener('click', click); document.addEventListener('submit', submit);
    window.addEventListener('hashchange', () => { if (location.hash === '#agreement') navigate('agreement'); else if (TITLES[location.hash.slice(1)]) { view = location.hash.slice(1); render(); } });
    save(); render();
  }
  function applySupplyCounts(rows) {
    if (!Array.isArray(rows) || !rows.length) return false;
    const checked = rows.map(row => ({ supply: state.supplies.find(s => s.id === row.id), quantity: Number(row.quantity) }));
    if (checked.some(row => !row.supply || !Number.isInteger(row.quantity) || row.quantity < 0 || row.quantity > 9999)) { toast('请核对物品与数量，填写 0—9999 的整数。'); return false; }
    const previousSupplies = JSON.parse(JSON.stringify(state.supplies)); const previousActivity = [...state.activity];
    checked.forEach(row => { row.supply.quantity = row.quantity; row.supply.updated = today(); });
    record(member(state.currentMember).name + '确认了一次公共物品模拟盘点');
    if (!save()) { state.supplies = previousSupplies; state.activity = previousActivity; render(); toast('存储空间不足，盘点未保存；原库存保持不变。'); return false; }
    render(); toast('盘点已确认，库存与补货提醒已更新。'); return true;
  }
  window.RoommateApp = { navigate, refresh: render, openExpense: newExpense, openIssue: newIssue, renderAgreement: agreementPage, applySupplyCounts, toast, reset: () => { state = seed(); if (window.RoommateLife) window.RoommateLife.reset(); save(); render(); }, getState: () => JSON.parse(JSON.stringify(state)), balances: () => ({ ...balances() }), allocate, suggestions: () => suggestions().map(x => ({ ...x })) };
  if (document.readyState !== 'complete') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
