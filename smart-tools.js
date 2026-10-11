(() => {
  'use strict';
  const MEMBERS = [{ id: 'm1', name: '小林' }, { id: 'm2', name: '阿哲' }, { id: 'm3', name: '小雨' }, { id: 'm4', name: '可可' }];
  const SAMPLES = {
    days: '本月水电费按居住天数分摊：小林30天，阿哲30天，小雨15天，可可30天。',
    area: '本月房租按房间面积分摊：小林18平方米，阿哲15平方米，小雨12平方米，可可15平方米。',
    usage: '这笔电费按用量分摊：小林40度，阿哲30度，小雨20度，可可10度。'
  };
  const drafts = new WeakMap();
  let photoUrl = null;
  let photoReady = false;
  let inventoryRecognized = false;
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = cents => '¥' + (Number(cents || 0) / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#icon-${name}"></use></svg>`;
  function notify(message) {
    const el = document.getElementById('toast'); if (!el) return;
    el.textContent = message; el.classList.add('show');
    clearTimeout(notify.timer); notify.timer = setTimeout(() => el.classList.remove('show'), 3500);
  }
  function gcd(a, b) { while (b) { const n = a % b; a = b; b = n; } return a; }
  function parseDescription(description, currentMember = 'm1') {
    let text = String(description || '').trim();
    if (!text) return { error: '先描述分摊依据，或点击下方示例。' };
    const me = MEMBERS.find(m => m.id === currentMember) || MEMBERS[0];
    text = text.replace(/(?:我本人|我)(?=[^，,;；。]{0,14}\d)/g, me.name);
    if (/四人均分|四人平分|大家均分|大家平分|平均分摊|平均分配/.test(text)) {
      return { basis: '四人均分', weights: { m1: 1, m2: 1, m3: 1, m4: 1 }, reasons: Object.fromEntries(MEMBERS.map(m => [m.id, '描述中明确选择四人均分，权重为 1。'])) };
    }
    const mode = /平方米|平米|㎡|房间面积|按面积/.test(text) ? 'area' : /居住|入住|天数|\d\s*(天|日)/.test(text) ? 'days' : /用量|电量|\d\s*(度|单位|小时|份|升|千瓦时|kwh|l\b)/i.test(text) ? 'usage' : null;
    if (!mode) return { error: '演示支持按居住天数、房间面积或用量分摊。请说明依据，并列出四位室友的数值。' };
    const values = {}; const units = {}; const reasons = {};
    const unitMap = { '平方米': 'area', '平米': 'area', '㎡': 'area', '天': 'days', '日': 'days', '度': 'electricity', '千瓦时': 'electricity', 'kwh': 'electricity', '小时': 'hours', 'h': 'hours', '份': 'portions', '单位': 'generic', '升': 'liters', 'l': 'liters' };
    let usageUnit = null;
    for (const m of MEMBERS) {
      const matches = [...text.matchAll(new RegExp(m.name + '[^\\d\\n，,;；。+\\-]{0,16}(-?\\d+(?:\\.\\d+)?)\\s*([^\\d\\s，,;；。:：()（）]+)?', 'g'))];
      if (matches.length !== 1) return { error: `${m.name}的数值${matches.length ? '出现多次' : '尚未提供'}。请为每位室友填写一个明确数值；不参与可填写 0。` };
      const n = Number(matches[0][1]);
      if (!Number.isFinite(n) || n < 0 || n > 100000 || !/^\d+(?:\.\d{1,2})?$/.test(matches[0][1])) return { error: `${m.name}的数值需为 0—100000，最多两位小数。` };
      const unit = matches[0][2] || (mode === 'days' ? '天' : mode === 'area' ? '平方米' : '单位');
      const normalizedUnit = unitMap[unit.toLowerCase()];
      if (!normalizedUnit) return { error: `${m.name}的单位“${unit}”暂不支持。请使用统一、明确的天数、面积或用量单位。` };
      const unitMode = normalizedUnit === 'area' ? 'area' : normalizedUnit === 'days' ? 'days' : 'usage';
      if (unitMode !== mode) return { error: '请使用同一种分摊依据。复合规则需要与室友进一步协商，本演示不自动推断。' };
      if (mode === 'usage') {
        if (usageUnit && usageUnit !== normalizedUnit) return { error: '用量分摊需使用同一单位，不能将度、小时、份等不同单位直接混算。请先统一单位。' };
        usageUnit = normalizedUnit;
      }
      values[m.id] = Math.round(n * 100); units[m.id] = unit;
      reasons[m.id] = n === 0 ? '明确填写 0，本笔费用不参与分摊。' : `描述中提供 ${n}${unit}，按${mode === 'days' ? '居住天数' : mode === 'area' ? '房间面积' : '用量'}成比例分摊。`;
    }
    const nums = Object.values(values).filter(n => n > 0);
    if (!nums.length) return { error: '至少需要一位室友的数值大于 0。' };
    const factor = nums.reduce((a, b) => gcd(a, b));
    let weights = Object.fromEntries(MEMBERS.map(m => [m.id, values[m.id] / factor]));
    const largest = Math.max(...Object.values(weights));
    const rounded = largest > 1000;
    if (rounded) weights = Object.fromEntries(MEMBERS.map(m => [m.id, values[m.id] === 0 ? 0 : Math.max(1, Math.round(weights[m.id] / largest * 1000))]));
    return { basis: mode === 'days' ? '按居住天数' : mode === 'area' ? '按房间面积' : '按实际用量', weights, reasons, rounded };
  }
  function enhancePages() {
    const main = document.getElementById('main-content'); if (!main) return;
    const page = document.querySelector('.side-nav [aria-current="page"]')?.dataset.view || location.hash.slice(1);
    if (page === 'expenses' && !main.querySelector('.smart-expense-entry')) {
      main.insertAdjacentHTML('afterbegin', `<section class="smart-feature-card smart-expense-entry"><div class="smart-feature-icon">✦</div><div class="smart-feature-copy"><div class="smart-feature-kicker">AI 分摊助手 <span class="smart-demo-label">交互演示</span></div><h2>住得不一样，也可以分得明白。</h2><p>把居住天数、房间面积或用量说清楚，生成可解释、可调整的分摊建议。</p></div><button type="button" class="btn smart-feature-button" data-smart-action="open-split">描述情况，AI帮你算 ${icon('arrow')}</button></section>`);
    }
    if (page === 'supplies' && !main.querySelector('.smart-stock-entry')) {
      main.insertAdjacentHTML('afterbegin', `<section class="smart-feature-card smart-stock-entry"><div class="smart-feature-icon">▦</div><div class="smart-feature-copy"><div class="smart-feature-kicker">拍照盘点 <span class="smart-demo-label">模拟识别</span></div><h2>拍一下，把公共物品盘清楚。</h2><p>本地预览照片，体验数量建议；校正后更新库存，自动显示补货提醒。</p></div><button type="button" class="btn smart-feature-button" data-smart-action="open-stock">体验拍照盘点 ${icon('arrow')}</button></section>`);
    }
  }
  function enhanceExpense() {
    const form = document.getElementById('expense-form'); if (!form || form.querySelector('.smart-split-panel')) return;
    const body = form.querySelector('.modal-body') || form;
    body.insertAdjacentHTML('afterbegin', `<section class="smart-split-panel"><div class="smart-panel-heading"><span class="smart-mini-spark">✦</span><div><h3>描述情况，AI 帮你算</h3><p>AI演示 · 模拟结果，请室友确认</p></div></div><label class="smart-text-label" for="smart-split-description">这笔费用怎么分？</label><textarea id="smart-split-description" rows="3" maxlength="500" placeholder="例如：水电按居住天数分摊，小林30天、阿哲30天、小雨15天、可可30天。"></textarea><div class="smart-examples"><span>试试示例</span><button type="button" data-smart-action="split-sample" data-sample="days">居住天数</button><button type="button" data-smart-action="split-sample" data-sample="area">房间面积</button><button type="button" data-smart-action="split-sample" data-sample="usage">实际用量</button></div><div class="smart-split-toolbar"><small>只使用你填写的数值，不推断生活情况。</small><button type="button" class="btn smart-calculate" data-smart-action="calculate-split">✦ 模拟 AI 测算</button></div><p class="smart-error" role="alert"></p><div class="smart-split-results" hidden></div></section>`);
  }
  function splitError(form, text) { form.querySelector('.smart-error').textContent = text; }
  function calculate(form) {
    const result = parseDescription(form.querySelector('#smart-split-description').value, window.RoommateApp?.getState().currentMember);
    if (result.error) { splitError(form, result.error); return; }
    drafts.set(form, result); splitError(form, '');
    const target = form.querySelector('.smart-split-results'); target.hidden = false;
    target.innerHTML = `<div class="smart-result-heading"><strong>${esc(result.basis)} · 分摊建议</strong><span>可手动调整权重</span></div><div class="smart-member-results">${MEMBERS.map(m => `<div class="smart-member-result"><div class="smart-member-top"><strong>${m.name}</strong><span data-smart-percent="${m.id}"></span><b data-smart-share="${m.id}"></b></div><p>${esc(result.reasons[m.id])}</p><label>相对权重<input type="text" inputmode="numeric" value="${result.weights[m.id]}" data-smart-weight="${m.id}" aria-label="${m.name}的建议权重，0到1000的整数"></label></div>`).join('')}</div><p class="smart-result-note">${result.rounded ? '比例过大，已将相对权重归一并取整；请核对份额。' : '比例仅依据所填数值；公平规则仍需室友共同确认。'}<span class="smart-amount-hint"></span></p><div class="smart-result-footer"><span class="smart-apply-state">建议不会自动保存为账单。</span><button type="button" class="btn btn-primary" data-smart-action="apply-split">应用到本笔费用</button></div>`;
    updateSplitSummary(form);
  }
  function readDraftWeights(form) {
    const result = drafts.get(form); if (!result) return null;
    const raw = Object.fromEntries(MEMBERS.map(m => [m.id, String(form.querySelector(`[data-smart-weight="${m.id}"]`)?.value || '').trim()]));
    if (Object.values(raw).some(n => !/^\d{1,4}$/.test(n))) return null;
    const weights = Object.fromEntries(MEMBERS.map(m => [m.id, Number(raw[m.id])]));
    if (Object.values(weights).some(n => !Number.isInteger(n) || n < 0 || n > 1000) || !Object.values(weights).some(n => n > 0)) return null;
    result.weights = weights; return weights;
  }
  function updateSplitSummary(form) {
    if (!drafts.has(form)) return;
    const weights = readDraftWeights(form);
    if (!weights) { splitError(form, '权重请填写 0—1000 的整数，且至少一位大于 0。'); return; }
    splitError(form, '');
    const amount = Number(form.elements.namedItem('amount')?.value);
    const cents = Number.isFinite(amount) && amount > 0 && amount <= 1000000 ? Math.round(amount * 100) : 0;
    const active = Object.fromEntries(Object.entries(weights).filter(([, n]) => n > 0));
    const shares = cents && window.RoommateApp?.allocate ? window.RoommateApp.allocate(cents, active) : {};
    const sum = Object.values(weights).reduce((n, x) => n + x, 0);
    for (const m of MEMBERS) {
      form.querySelector(`[data-smart-percent="${m.id}"]`).textContent = (weights[m.id] / sum * 100).toFixed(1) + '%';
      form.querySelector(`[data-smart-share="${m.id}"]`).textContent = weights[m.id] === 0 ? '不参与' : cents ? money(shares[m.id]) : '金额待填';
    }
    form.querySelector('.smart-amount-hint').textContent = cents ? ` 当前总额 ${money(cents)}，份额精确到分。` : ' 填写下方总金额后，会自动展示每人的费用。';
  }
  function applySplit(form) {
    const weights = readDraftWeights(form); if (!weights) return splitError(form, '先生成建议，并填写有效权重。');
    const split = form.elements.namedItem('split'); split.value = 'weighted';
    for (const m of MEMBERS) {
      const participant = form.querySelector(`input[name="participant"][value="${m.id}"]`);
      if (participant) participant.checked = weights[m.id] > 0;
      const input = form.elements.namedItem('weight-' + m.id); if (input) input.value = String(weights[m.id] || 1);
    }
    split.dispatchEvent(new Event('change', { bubbles: true }));
    drafts.get(form).applied = true;
    form.querySelector('.smart-apply-state').textContent = '✓ 已应用。核对下方金额与分摊明细，再保存费用。';
    notify('建议已应用到本笔费用，请核对后保存。');
  }
  function closeStock() {
    const root = document.getElementById('smart-modal-root');
    root?.querySelector('dialog')?.close(); if (root) root.innerHTML = '';
    if (photoUrl) URL.revokeObjectURL(photoUrl); photoUrl = null; photoReady = false; inventoryRecognized = false;
    document.querySelector('[data-smart-action="open-stock"]')?.focus();
  }
  function openStock() {
    let root = document.getElementById('smart-modal-root');
    if (!root) { root = document.createElement('div'); root.id = 'smart-modal-root'; document.body.append(root); }
    photoReady = false; inventoryRecognized = false;
    root.innerHTML = `<dialog class="smart-stock-dialog" aria-labelledby="smart-stock-title"><div class="modal-header"><div><h2 id="smart-stock-title">拍照盘点公共物品</h2><p>本地预览 · 模拟识别 · 确认后更新库存</p></div><button type="button" class="modal-close" data-smart-action="close-stock" aria-label="关闭盘点">×</button></div><form id="smart-inventory-form"><div class="smart-stock-body"><div class="smart-photo-preview"><div class="smart-photo-empty"><span>▧</span><strong>先给公共物品拍张照</strong><p>照片仅在当前浏览器预览，不会上传。</p></div></div><div class="smart-photo-actions"><label class="btn btn-secondary smart-upload-label">${icon('box')} 选择照片 / 拍照<input id="smart-stock-file" type="file" accept="image/*" capture="environment" aria-label="选择公共物品照片"></label><button type="button" class="btn btn-ghost" data-smart-action="stock-sample">体验示例图片</button></div><div class="smart-recognition-notice"><strong>AI 交互演示</strong><p>“模拟识别”展示预设数量，并未实际分析照片。请逐项核对与校正；库存只在你确认后更新。</p></div><button type="button" class="btn smart-calculate smart-recognize-button" data-smart-action="recognize-stock">✦ 模拟识别物品与数量</button><div class="smart-stock-results" hidden></div><p class="smart-stock-error smart-error" role="alert"></p></div><div class="smart-stock-footer"><button type="button" class="btn btn-secondary" data-smart-action="close-stock">取消</button><button type="submit" class="btn btn-primary">确认盘点，更新库存</button></div></form></dialog>`;
    const dialog = root.querySelector('dialog'); dialog.showModal();
    dialog.addEventListener('cancel', e => { e.preventDefault(); closeStock(); });
    dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeStock(); } });
  }
  function stockError(text) { const e = document.querySelector('.smart-stock-error'); if (e) e.textContent = text; }
  function clearStockResults() { inventoryRecognized = false; const e = document.querySelector('.smart-stock-results'); if (e) { e.hidden = true; e.innerHTML = ''; } stockError(''); }
  function showSamplePhoto() {
    if (photoUrl) URL.revokeObjectURL(photoUrl); photoUrl = null;
    const file = document.getElementById('smart-stock-file'); if (file) file.value = '';
    document.querySelector('.smart-photo-preview').innerHTML = `<div class="smart-sample-scene" aria-label="示例静物插画，展示洗衣液、抽纸、垃圾袋和大米，并非真实照片"><span class="smart-scene-label">示例静物插画</span><div class="smart-scene-objects"><div><span class="smart-scene-bottle">✧</span><small>洗衣液</small></div><div><span class="smart-scene-tissue">▤</span><small>抽纸</small></div><div><span class="smart-scene-bag">◉</span><small>垃圾袋</small></div><div><span class="smart-scene-rice">米</span><small>大米</small></div></div></div>`;
    photoReady = true; clearStockResults();
  }
  function showPhoto(input) {
    const file = input.files?.[0]; if (!file) return;
    if (!file.type.startsWith('image/')) { stockError('请选择图片文件。'); input.value = ''; return; }
    if (file.size > 15 * 1024 * 1024) { stockError('照片需小于 15 MB，请选择较小图片。'); input.value = ''; return; }
    if (photoUrl) URL.revokeObjectURL(photoUrl); photoUrl = URL.createObjectURL(file);
    const img = document.createElement('img'); img.alt = '所选公共物品照片，仅本地预览'; img.src = photoUrl;
    const box = document.querySelector('.smart-photo-preview'); box.replaceChildren(img);
    img.addEventListener('error', () => { photoReady = false; stockError('图片无法预览，请换一张照片或使用示例。'); });
    photoReady = true; clearStockResults();
  }
  function recognizeStock() {
    if (!photoReady) return stockError('请先选择一张照片，或点击“体验示例图片”。');
    const supplies = window.RoommateApp?.getState().supplies || [];
    if (!supplies.length) return stockError('请先在公共物品页登记物品，再进行盘点。');
    const box = document.querySelector('.smart-stock-results'); box.hidden = false;
    const demoCounts = [0, 3, 1, 2];
    box.innerHTML = `<div class="smart-result-heading"><strong>模拟盘点结果</strong><span>共 ${supplies.length} 种已登记物品</span></div><p class="smart-stock-result-note">以下为预设示例数量，不来自照片分析。确认前请逐项校正；此操作更新现有库存，不会重复登记物品。</p><div class="smart-stock-list">${supplies.map((s, i) => `<label class="smart-stock-row"><span><strong>${esc(s.name)}</strong><small>原记录：${s.quantity} ${esc(s.unit)} · 提醒线 ${s.threshold} ${esc(s.unit)}</small></span><span class="smart-count-input"><input type="number" min="0" max="9999" step="1" value="${i < demoCounts.length ? demoCounts[i] : s.quantity}" data-smart-stock-id="${esc(s.id)}" aria-label="${esc(s.name)}盘点数量" required><small>${esc(s.unit)}</small></span></label>`).join('')}</div><div class="smart-stock-total-note">✓ 低于或等于提醒线的物品，会立即出现在补货提醒中。</div>`;
    inventoryRecognized = true; stockError('');
  }
  function submitStock(e) {
    if (e.target.id !== 'smart-inventory-form') return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (!inventoryRecognized) return stockError('请先点击“模拟识别”，核对数量后再确认。');
    const counts = [...e.target.querySelectorAll('[data-smart-stock-id]')].map(input => ({ id: input.dataset.smartStockId, quantity: Number(input.value) }));
    if (!counts.length || counts.some(c => !Number.isInteger(c.quantity) || c.quantity < 0 || c.quantity > 9999)) return stockError('盘点数量请填写 0—9999 的整数。');
    if (typeof window.RoommateApp?.applySupplyCounts !== 'function') return stockError('盘点保存接口尚未就绪，请稍后再试。');
    try {
      if (window.RoommateApp.applySupplyCounts(counts) === false) return stockError('库存更新失败，物品记录可能已改变。请核对后重试，当前盘点尚未保存。');
    } catch (_) { return stockError('库存暂未保存，请核对数量并重试。'); }
    closeStock(); notify('盘点已确认，库存与补货提醒已更新。');
  }
  function click(e) {
    const button = e.target.closest('[data-smart-action]'); if (!button) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const action = button.dataset.smartAction;
    if (action === 'open-split') {
      if (typeof window.RoommateApp?.openExpense === 'function') window.RoommateApp.openExpense();
      else document.getElementById('primary-action')?.click();
      enhanceExpense(); document.getElementById('smart-split-description')?.focus();
    } else if (action === 'split-sample') {
      const form = button.closest('#expense-form'); form.querySelector('#smart-split-description').value = SAMPLES[button.dataset.sample] || SAMPLES.days;
      drafts.delete(form); form.querySelector('.smart-split-results').hidden = true;
      splitError(form, ''); form.querySelector('#smart-split-description').focus();
    } else if (action === 'calculate-split') calculate(button.closest('#expense-form'));
    else if (action === 'apply-split') applySplit(button.closest('#expense-form'));
    else if (action === 'open-stock') openStock();
    else if (action === 'close-stock') closeStock();
    else if (action === 'stock-sample') showSamplePhoto();
    else if (action === 'recognize-stock') recognizeStock();
  }
  function init() {
    document.addEventListener('click', click, true);
    document.addEventListener('submit', submitStock, true);
    document.addEventListener('change', e => { if (e.target.id === 'smart-stock-file') showPhoto(e.target); }, true);
    document.addEventListener('input', e => {
      const form = e.target.closest('#expense-form'); if (!form) return;
      if (e.target.hasAttribute('data-smart-weight') && drafts.has(form)) {
        drafts.get(form).applied = false;
        form.querySelector('.smart-apply-state').textContent = '建议已修改，请重新应用。下方账单仍使用上次应用的权重。';
      }
      if (e.target.name === 'amount' || e.target.hasAttribute('data-smart-weight')) updateSplitSummary(form);
      if (e.target.id === 'smart-split-description' && drafts.has(form)) {
        drafts.delete(form); form.querySelector('.smart-split-results').hidden = true;
      }
    }, true);
    const main = document.getElementById('main-content'); const modal = document.getElementById('modal-root');
    const observer = new MutationObserver(() => { enhancePages(); enhanceExpense(); });
    if (main) observer.observe(main, { childList: true, subtree: true });
    if (modal) observer.observe(modal, { childList: true, subtree: true });
    enhancePages(); enhanceExpense();
  }
  window.RoommateSmartTools = { parseDescription, samples: { ...SAMPLES } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
