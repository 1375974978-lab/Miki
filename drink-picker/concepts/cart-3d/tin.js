(() => {
  const layer = document.querySelector('#tin-layer');
  const panel = layer.querySelector('.tin-panel');
  const scroller = document.querySelector('#tin-drinks');
  const count = document.querySelector('#tin-count');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const cardView = window.drinkCardView;
  let drinks = [];
  let colorFor = () => '#fdf4b5';
  let cards = [];
  let isOpen = false;
  let isClosing = false;
  let closeTimers = [];
  let openingTimer = null;
  let frame = null;
  let lastFrame = 0;
  let lastScroll = 0;
  let scrollVelocity = 0;
  let scrollTarget = 0;
  let lastWheel = 0;
  let holdTimer = null;
  let holdOrigin = null;
  let suppressClick = false;
  let returnFocus = null;

  function clearCloseTimers() {
    closeTimers.forEach(clearTimeout);
    closeTimers = [];
  }
  function favorites() {
    return drinks.filter(drink => cardView.recordFor(drink.id).favorite);
  }
  function renderTin(resetScroll = false) {
    const saved = favorites();
    const enterFromPile = resetScroll || (!cards.length && !!saved.length);
    const previousScroll = resetScroll ? 0 : scroller.scrollTop;
    count.textContent = `${saved.length} 款`;
    scroller.innerHTML = saved.length
      ? `<div class="tin-card-grid">${saved.map(drink => `<div class="tin-card-slot" data-id="${cardView.escapeHtml(drink.id)}"><button class="tin-card-button" type="button" data-tin-drink="${cardView.escapeHtml(drink.id)}" aria-label="打开${cardView.escapeHtml(drink.name)}详情，长按或右键取消收藏"><div class="tin-card-face drink-card ${cardView.hasBrandLogo(drink) ? 'has-brand-logo' : ''}" style="--card-color:${colorFor(drink)}">${cardView.cardMarkup(drink, true)}</div></button><button class="tin-remove" type="button" data-tin-remove="${cardView.escapeHtml(drink.id)}" aria-label="取消收藏${cardView.escapeHtml(drink.name)}" title="取消收藏">×</button></div>`).join('')}</div>`
      : '<div class="tin-empty"><span class="tin-stars" aria-hidden="true">✦ ✧ ✦</span><strong>铁盒空空，快去收藏喜欢的饮品吧</strong><p>DRINK? · YOUR LITTLE KEEPSAKES</p></div>';
    cards = [...scroller.querySelectorAll('.tin-card-slot')].map((element, index) => ({
      element,
      index,
      pose: { x: 0, y: 0, rotation: 0, opacity: 1 },
      visibleAt: performance.now() + (reducedMotion.matches || !enterFromPile ? 0 : 650 + index * 65),
      leaving: false,
    }));
    scroller.scrollTop = previousScroll;
    scrollTarget = previousScroll;
    lastScroll = previousScroll;
    if (isOpen && !reducedMotion.matches) {
      if (enterFromPile) setPile(true);
      else cards.forEach(item => { item.pose = targetFor(item); applyPose(item); });
      startFrame();
    }
  }
  function targetFor(item) {
    if (isClosing || item.leaving) return pileFor(item);
    if (performance.now() < item.visibleAt) return { ...pileFor(item), opacity: 0 };
    if (performance.now() < item.visibleAt + 650) return fanFor(item);
    const drift = Math.max(-10, Math.min(10, scrollVelocity * .7));
    return {
      x: Math.sin(item.index * 2.43) * 4 + drift * .3,
      y: Math.cos(item.index * 1.7) * 3 + drift,
      rotation: Math.sin(item.index * 2.17) * 2.1 + drift * .12,
      opacity: performance.now() >= item.visibleAt ? 1 : 0,
    };
  }
  function pileFor(item) {
    const grid = scroller.querySelector('.tin-card-grid');
    if (!grid) return { x: 0, y: 0, rotation: 0, opacity: 0 };
    const centerX = grid.clientWidth / 2;
    const centerY = 110;
    return {
      x: centerX - item.element.offsetLeft - item.element.offsetWidth / 2 + ((item.index % 3) - 1) * 6,
      y: centerY - item.element.offsetTop - item.element.offsetHeight / 2 + ((item.index * 7) % 5 - 2) * 4,
      rotation: (item.index % 2 ? 1 : -1) * (4 + item.index * 1.3),
      opacity: item.leaving ? 0 : 1,
    };
  }
  function fanFor(item) {
    const grid = scroller.querySelector('.tin-card-grid');
    const cardWidth = item.element.offsetWidth;
    const radius = Math.max(550, cardWidth * 3.4);
    const columns = Math.max(1, Math.round(grid.clientWidth / (cardWidth + 16)));
    const row = Math.floor(item.index / columns);
    const slot = item.index % columns;
    const rowCount = Math.min(columns, cards.length - row * columns);
    const step = 2 * Math.asin(1.05 * cardWidth / (2 * radius));
    const angle = (slot - (rowCount - 1) / 2) * step;
    return {
      x: grid.clientWidth / 2 + radius * Math.sin(angle) - item.element.offsetLeft - cardWidth / 2,
      y: radius * (1 - Math.cos(angle)) - 20,
      rotation: angle * 180 / Math.PI,
      opacity: 1,
    };
  }
  function applyPose(item) {
    const { x, y, rotation, opacity } = item.pose;
    item.element.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
    item.element.style.opacity = opacity;
  }
  function setPile(hidden = false) {
    cards.forEach(item => {
      item.pose = pileFor(item);
      item.pose.opacity = hidden ? 0 : 1;
      applyPose(item);
    });
  }
  function animate(now) {
    frame = null;
    if (!isOpen && !isClosing) return;
    const dt = lastFrame ? Math.min(64, now - lastFrame) : 16.67;
    lastFrame = now;
    if (now - lastWheel > 250) scrollTarget = scroller.scrollTop;
    const scrollWeight = 1 - Math.pow(1 - .06, dt / 16.67);
    if (Math.abs(scrollTarget - scroller.scrollTop) > .25) scroller.scrollTop += (scrollTarget - scroller.scrollTop) * scrollWeight;
    scrollVelocity *= Math.pow(.78, dt / 16.67);
    cards.forEach(item => {
      const target = targetFor(item);
      const weight = 1 - Math.pow(1 - (.055 + item.index % 4 * .008), dt / 16.67);
      for (const key of ['x', 'y', 'rotation', 'opacity']) item.pose[key] += (target[key] - item.pose[key]) * weight;
      applyPose(item);
    });
    startFrame();
  }
  function startFrame() {
    if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(animate);
  }
  function stopFrame() {
    if (frame) cancelAnimationFrame(frame);
    frame = null;
    lastFrame = 0;
  }
  function openTin() {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    clearCloseTimers();
    clearTimeout(openingTimer);
    isClosing = false;
    isOpen = true;
    layer.hidden = false;
    layer.setAttribute('aria-hidden', 'false');
    renderTin(true);
    requestAnimationFrame(() => layer.classList.add('is-open'));
    openingTimer = setTimeout(() => {
      panel.focus({ preventScroll: true });
      startFrame();
    }, reducedMotion.matches ? 0 : 650);
  }
  function closeTin() {
    if (!isOpen || isClosing) return;
    isClosing = true;
    clearTimeout(openingTimer);
    clearTimeout(holdTimer);
    if (reducedMotion.matches) {
      layer.classList.remove('is-open');
      layer.hidden = true;
      layer.setAttribute('aria-hidden', 'true');
      isOpen = false;
      isClosing = false;
      window.dispatchEvent(new Event('tin-close'));
      if (returnFocus?.isConnected && returnFocus !== document.body) returnFocus.focus({ preventScroll: true });
      else document.querySelector('#scene').focus({ preventScroll: true });
      return;
    }
    closeTimers.push(setTimeout(() => layer.classList.remove('is-open'), 650));
    closeTimers.push(setTimeout(() => window.dispatchEvent(new Event('tin-close')), 1330));
    closeTimers.push(setTimeout(() => {
      layer.hidden = true;
      layer.setAttribute('aria-hidden', 'true');
      isOpen = false;
      isClosing = false;
      stopFrame();
      if (returnFocus?.isConnected && returnFocus !== document.body) returnFocus.focus({ preventScroll: true });
      else document.querySelector('#scene').focus({ preventScroll: true });
    }, 1650));
  }
  function removeFavorite(id, focusUndo = false) {
    const item = cards.find(entry => entry.element.dataset.id === id);
    if (!item || item.leaving) return;
    item.leaving = true;
    item.element.style.pointerEvents = 'none';
    if (reducedMotion.matches) {
      finishRemoval(id, focusUndo);
      return;
    }
    setTimeout(() => finishRemoval(id, focusUndo), 420);
  }
  function finishRemoval(id, focusUndo) {
    const wasLast = favorites().length === 1;
    if (!cardView.updateRecord(id, { favorite: false })) {
      renderTin();
      return;
    }
    window.dispatchEvent(new CustomEvent('drink-favorite-change', { detail: { id, favorite: false } }));
    if (wasLast && !reducedMotion.matches) {
      scroller.classList.add('just-emptied');
      setTimeout(() => scroller.classList.remove('just-emptied'), 850);
    }
    cardView.showToast('已取消收藏', {
      label: '撤销',
      focus: focusUndo,
      onClick: () => {
        if (!cardView.updateRecord(id, { favorite: true })) return;
        window.dispatchEvent(new CustomEvent('drink-favorite-change', { detail: { id, favorite: true } }));
        cardView.showToast('已恢复收藏');
      },
    });
  }
  function cancelHold() { clearTimeout(holdTimer); holdTimer = null; holdOrigin = null; }
  layer.querySelector('.tin-backdrop').addEventListener('click', closeTin);
  scroller.addEventListener('wheel', event => {
    if (reducedMotion.matches || !matchMedia('(pointer: fine)').matches) return;
    event.preventDefault();
    const delta = event.deltaY * (event.deltaMode === 1 ? 32 : 1);
    scrollTarget = Math.max(0, Math.min(scroller.scrollHeight - scroller.clientHeight, scrollTarget + delta * .75));
    lastWheel = performance.now();
    startFrame();
  }, { passive: false });
  scroller.addEventListener('scroll', () => {
    scrollVelocity = scroller.scrollTop - lastScroll;
    lastScroll = scroller.scrollTop;
    startFrame();
  });
  scroller.addEventListener('click', event => {
    const remove = event.target.closest('[data-tin-remove]');
    if (remove) { removeFavorite(remove.dataset.tinRemove, event.detail === 0); return; }
    const button = event.target.closest('[data-tin-drink]');
    if (!button || suppressClick || isClosing) { suppressClick = false; return; }
    const drink = drinks.find(entry => entry.id === button.dataset.tinDrink);
    if (drink) window.dispatchEvent(new CustomEvent('drink-card-open', { detail: { drink, color: colorFor(drink) } }));
  });
  scroller.addEventListener('contextmenu', event => {
    const button = event.target.closest('[data-tin-drink]');
    if (!button) return;
    event.preventDefault();
    cancelHold();
    removeFavorite(button.dataset.tinDrink);
  });
  scroller.addEventListener('pointerdown', event => {
    const button = event.target.closest('[data-tin-drink]');
    if (!button || event.pointerType === 'mouse') return;
    holdOrigin = { x: event.clientX, y: event.clientY };
    holdTimer = setTimeout(() => {
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 700);
      removeFavorite(button.dataset.tinDrink);
      cancelHold();
    }, 600);
  });
  scroller.addEventListener('pointermove', event => {
    if (holdOrigin && Math.hypot(event.clientX - holdOrigin.x, event.clientY - holdOrigin.y) > 8) cancelHold();
  });
  scroller.addEventListener('pointerup', cancelHold);
  scroller.addEventListener('pointercancel', cancelHold);
  scroller.addEventListener('keydown', event => {
    if (event.key !== 'Delete' && event.key !== 'Backspace') return;
    const button = event.target.closest('[data-tin-drink]');
    if (!button) return;
    event.preventDefault();
    removeFavorite(button.dataset.tinDrink, true);
  });
  window.addEventListener('drink-library-ready', event => {
    drinks = event.detail.drinks;
    colorFor = event.detail.colorFor;
    if (isOpen) renderTin();
  });
  window.addEventListener('drink-favorite-change', () => {
    if (isOpen && !isClosing) renderTin();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isOpen && document.querySelector('#card-layer').hidden) closeTin();
  });
  window.addEventListener('cart-stage', event => {
    if (event.detail.name === 'tin') openTin();
    else if (isOpen && !isClosing) {
      clearCloseTimers();
      layer.classList.remove('is-open');
      layer.hidden = true;
      layer.setAttribute('aria-hidden', 'true');
      isOpen = false;
      isClosing = false;
      stopFrame();
    }
  });
  if (new URLSearchParams(location.search).get('focus') === 'tin') openTin();
})();
