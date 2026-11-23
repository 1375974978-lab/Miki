(() => {
  const STORAGE_KEY = 'drink-picker:v1';
  const layer = document.querySelector('#card-layer');
  const card = document.querySelector('#drink-card');
  const commentLayer = document.querySelector('#comment-layer');
  const commentInput = document.querySelector('#comment-input');
  const toast = document.querySelector('#card-toast');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let currentDrink = null;
  let closeTimer = null;
  let toastTimer = null;
  let drag = null;
  let returnFocus = null;
  let returnDialog = null;
  const brandLogos = {
    '一点点': 'yi-dian-dian.jpg',
    '古茗': 'guming.jpg',
    '喜茶': 'heytea.jpg',
    '奈雪的茶': 'naixue.jpg',
    '星巴克': 'starbucks.jpg',
    '李若桃': 'li-ruo-tao.jpg',
    '瑞幸': 'luckin.jpg',
    '茶百道': 'chabaidao.jpg',
    '蜜雪冰城': 'mixue.jpg',
    '霸王茶姬': 'chagee.jpg'
  };

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  function readRecords() {
    try {
      const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return records && typeof records === 'object' && !Array.isArray(records) ? records : {};
    } catch { return {}; }
  }
  function recordFor(id) { return readRecords()[id] || { favorite: false, rating: 0, note: '' }; }
  function updateRecord(id, changes) {
    try {
      const records = readRecords();
      records[id] = { ...records[id], ...changes };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return true;
    } catch {
      showToast('浏览器存储不可用');
      return false;
    }
  }
  function showToast(message, action = null) {
    clearTimeout(toastTimer);
    toast.replaceChildren(document.createTextNode(message));
    if (action) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = action.label;
      button.addEventListener('click', action.onClick, { once: true });
      toast.append(button);
      if (action.focus) requestAnimationFrame(() => button.focus({ preventScroll: true }));
    }
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, action ? 4800 : 2600);
  }
  function heartMarkup(saved) {
    return `<span class="heart-icon" aria-hidden="true">${saved ? '♥' : '♡'}</span>`;
  }
  function favoriteMarkup(drink) {
    const saved = !!recordFor(drink.id).favorite;
    return `${heartMarkup(saved)}<span>${saved ? '已收藏' : '收藏'}</span>`;
  }
  function cardMarkup(drink, preview = false) {
    const saved = !!recordFor(drink.id).favorite;
    const logo = brandLogos[drink.brand];
    const close = preview ? '<span class="card-close" aria-hidden="true">×</span>' : '<button class="card-close" type="button" aria-label="关闭饮品小卡" title="关闭">×</button>';
    const favorite = preview ? `<span class="card-favorite ${saved ? 'is-favorite' : ''}">${favoriteMarkup(drink)}</span>` : `<button class="card-favorite ${saved ? 'is-favorite' : ''}" type="button" aria-pressed="${saved}">${favoriteMarkup(drink)}</button>`;
    const comment = preview ? '<span class="card-comment">写评论</span>' : '<button class="card-comment" type="button">写评论</button>';
    return `
      <div class="card-top"><div class="card-kicker">DRINK? · STAR CARD</div>${close}${logo ? `<img class="card-logo" src="brand-logos/${logo}" alt="${escapeHtml(drink.brand)}标识">` : ''}<span class="card-sparkles" aria-hidden="true">✦ ✧</span><h2 class="card-title">${escapeHtml(drink.name)}</h2><span class="card-brand">${escapeHtml(drink.brand)}</span><div class="card-flavors">${drink.flavors.map(flavor => `<span>${escapeHtml(flavor)}</span>`).join('')}<span>${escapeHtml(drink.category)}</span></div></div>
      <div class="card-body"><section class="card-copy"><h3>值得试试</h3><p>${escapeHtml(drink.praise)}</p></section><section class="card-copy"><h3>点前留意</h3><p>${escapeHtml(drink.caution)}</p></section><section class="card-copy"><h3>搭配推荐</h3><p>${escapeHtml(drink.addOnSuggestion)}</p></section></div>
      <div class="card-actions">${favorite}${comment}</div>`;
  }
  function renderCard(drink, color) {
    card.style.setProperty('--card-color', color);
    card.classList.toggle('has-brand-logo', !!brandLogos[drink.brand]);
    card.setAttribute('aria-label', `${drink.name}饮品明星小卡`);
    card.innerHTML = cardMarkup(drink);
  }
  function openCard(drink, color) {
    clearTimeout(closeTimer);
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    returnDialog = returnFocus?.closest('[role="dialog"]');
    currentDrink = drink;
    card.style.setProperty('--drag-x', '0px');
    card.style.setProperty('--drag-y', '0px');
    renderCard(drink, color);
    layer.hidden = false;
    requestAnimationFrame(() => layer.classList.add('is-open'));
    card.querySelector('.card-close').focus({ preventScroll: true });
  }
  function closeCard() {
    if (layer.hidden || !commentLayer.hidden) return;
    layer.classList.remove('is-open');
    closeTimer = setTimeout(() => {
      layer.hidden = true;
      currentDrink = null;
      const target = returnFocus?.isConnected ? returnFocus : returnDialog?.querySelector('button');
      if (target?.isConnected) target.focus({ preventScroll: true });
    }, reducedMotion.matches ? 0 : 360);
  }
  window.addEventListener('drink-card-open', event => openCard(event.detail.drink, event.detail.color));
  document.querySelector('.card-backdrop').addEventListener('click', closeCard);
  card.addEventListener('click', event => {
    if (event.target.closest('.card-close')) closeCard();
    else if (event.target.closest('.card-favorite')) {
      const saved = !recordFor(currentDrink.id).favorite;
      if (!updateRecord(currentDrink.id, { favorite: saved })) return;
      const button = card.querySelector('.card-favorite');
      button.classList.toggle('is-favorite', saved);
      button.setAttribute('aria-pressed', String(saved));
      button.innerHTML = favoriteMarkup(currentDrink);
      showToast(saved ? '收藏成功' : '已取消收藏');
      if (saved && !reducedMotion.matches) {
        const burst = document.createElement('span');
        burst.className = 'card-star-burst';
        burst.setAttribute('aria-hidden', 'true');
        burst.textContent = '✦ ✧ ✦';
        card.querySelector('.card-top').append(burst);
        burst.addEventListener('animationend', () => burst.remove(), { once: true });
      }
      window.dispatchEvent(new CustomEvent('drink-favorite-change', { detail: { id: currentDrink.id, favorite: saved } }));
    } else if (event.target.closest('.card-comment')) {
      commentInput.value = recordFor(currentDrink.id).note || '';
      commentLayer.hidden = false;
      commentInput.focus();
    }
  });
  document.querySelector('.comment-backdrop').addEventListener('click', () => {
    commentLayer.hidden = true;
    card.querySelector('.card-comment')?.focus({ preventScroll: true });
  });
  document.querySelector('#comment-cancel').addEventListener('click', () => { commentLayer.hidden = true; card.querySelector('.card-comment').focus(); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || layer.hidden) return;
    event.stopImmediatePropagation();
    if (!commentLayer.hidden) {
      commentLayer.hidden = true;
      card.querySelector('.card-comment')?.focus({ preventScroll: true });
    } else closeCard();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const dialog = !commentLayer.hidden ? commentLayer.querySelector('[role="dialog"]')
      : !layer.hidden ? card
      : !document.querySelector('#gacha-filter-layer').hidden ? document.querySelector('.gacha-filter-sheet')
      : [...document.querySelectorAll('#menu-layer, #tin-layer, #gacha-layer, #ranking-layer')]
        .filter(item => item.getAttribute('aria-hidden') === 'false')
        .map(item => item.querySelector('[role="dialog"]'))[0];
    if (!dialog) return;
    const focusable = [...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex="-1"])')]
      .filter(item => item.getClientRects().length && getComputedStyle(item).visibility !== 'hidden');
    if (!focusable.length) { event.preventDefault(); dialog.focus({ preventScroll: true }); return; }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!dialog.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus({ preventScroll: true });
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  });
  document.querySelector('#comment-form').addEventListener('submit', event => {
    event.preventDefault();
    if (updateRecord(currentDrink.id, { note: commentInput.value.trim() })) {
      commentLayer.hidden = true;
      showToast('评价已保存');
      card.querySelector('.card-comment').focus();
    }
  });
  window.drinkCardView = { cardMarkup, recordFor, updateRecord, showToast, escapeHtml, hasBrandLogo: drink => !!brandLogos[drink.brand] };
  card.addEventListener('pointerdown', event => {
    if (!event.target.closest('.card-top') || event.target.closest('button')) return;
    drag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, offsetX: parseFloat(card.style.getPropertyValue('--drag-x')) || 0, offsetY: parseFloat(card.style.getPropertyValue('--drag-y')) || 0 };
    card.setPointerCapture(event.pointerId);
  });
  card.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const limitX = Math.max(0, (innerWidth - card.offsetWidth) / 2 - 12);
    const limitY = Math.max(0, (innerHeight - card.offsetHeight) / 2 - 12);
    const x = Math.max(-limitX, Math.min(limitX, drag.offsetX + event.clientX - drag.x));
    const y = Math.max(-limitY, Math.min(limitY, drag.offsetY + event.clientY - drag.y));
    card.style.setProperty('--drag-x', `${x}px`);
    card.style.setProperty('--drag-y', `${y}px`);
  });
  card.addEventListener('pointerup', () => { drag = null; });
  card.addEventListener('pointercancel', () => { drag = null; });
})();
