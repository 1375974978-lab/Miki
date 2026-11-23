(() => {
  const layer = document.querySelector('#gacha-layer');
  const panel = layer.querySelector('.gacha-panel');
  const pool = document.querySelector('#gacha-pool');
  const results = document.querySelector('#gacha-results');
  const tray = document.querySelector('#gacha-tray');
  const outlet = document.querySelector('#gacha-outlet');
  const count = document.querySelector('#gacha-count');
  const hint = document.querySelector('#gacha-hint');
  const startButton = document.querySelector('#gacha-start');
  const filterButton = document.querySelector('#gacha-filter-open');
  const filterLayer = document.querySelector('#gacha-filter-layer');
  const filterGroups = document.querySelector('#gacha-filter-groups');
  const repeatInput = document.querySelector('#gacha-repeat');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const labels = { brands: '品牌', categories: '品类', flavors: '风味', needs: '想喝' };
  const colors = ['#fdf4b5', '#a9df71', '#febac4', '#e3d2ed', '#f8d5c0'];
  const emptyMessage = '这个分类暂时没有饮品，换个筛选条件试试';
  const selected = () => ({ brands: new Set(), categories: new Set(), flavors: new Set(), needs: new Set() });
  let filters = selected();
  let draft = selected();
  let drinks = [];
  let colorFor = () => colors[0];
  let isOpen = false;
  let isClosing = false;
  let isDrawing = false;
  let repeat = true;
  let consumed = new Set();
  let timers = [];
  let engine = null;
  let balls = [];
  let frame = null;
  let lastFrame = 0;
  let shakeUntil = 0;
  let filterReturnFocus = null;
  let returnFocus = null;

  const schedule = (callback, delay) => { const timer = setTimeout(callback, delay); timers.push(timer); return timer; };
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const candidates = () => drinks.filter(drink =>
    (!filters.brands.size || filters.brands.has(drink.brand)) &&
    (!filters.categories.size || filters.categories.has(drink.category)) &&
    [...filters.flavors].every(tag => drink.flavors.includes(tag)) &&
    [...filters.needs].every(tag => drink.needs.includes(tag)) &&
    (repeat || !consumed.has(drink.id))
  );
  function updateControls() {
    const available = candidates().length;
    count.textContent = drinks.length ? `${available} 款饮品` : '正在装入饮品';
    startButton.disabled = !available || !isOpen || isDrawing || isClosing;
    filterButton.disabled = !drinks.length || isDrawing || isClosing;
    hint.textContent = drinks.length && !available ? emptyMessage : '';
  }
  function makePhysics() {
    if (!window.Matter || reducedMotion.matches) return;
    engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
    const { Bodies, Composite } = Matter;
    const cx = 141, cy = 133, radius = 121;
    for (let index = 0; index < 16; index++) {
      const angle = index * Math.PI * 2 / 16;
      const nextAngle = (index + 1) * Math.PI * 2 / 16;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      const nx = cx + Math.cos(nextAngle) * radius;
      const ny = cy + Math.sin(nextAngle) * radius;
      const wall = Bodies.rectangle((x + nx) / 2, (y + ny) / 2, Math.hypot(nx - x, ny - y) + 8, 18, { isStatic: true, angle: Math.atan2(ny - y, nx - x), restitution: .68 });
      Composite.add(engine.world, wall);
    }
  }
  function stopPhysics() {
    if (frame) cancelAnimationFrame(frame);
    frame = null;
    lastFrame = 0;
    balls = [];
    if (engine) Matter.Engine.clear(engine);
    engine = null;
  }
  function tick(now) {
    frame = null;
    if (!isOpen || isClosing || reducedMotion.matches || !engine) return;
    const dt = lastFrame ? Math.min(34, now - lastFrame) : 1000 / 60;
    lastFrame = now;
    for (const ball of balls) {
      const body = ball.body;
      const jitter = now < shakeUntil ? .0018 : .00012;
      const towardX = (141 - body.position.x) * .0000007;
      const towardY = (139 - body.position.y) * .0000007;
      Matter.Body.applyForce(body, body.position, { x: towardX + Math.sin(now * .0014 + ball.index * 3.7) * jitter, y: towardY + Math.cos(now * .0012 + ball.index * 2.8) * jitter });
      if (body.speed > (now < shakeUntil ? 6 : 2.1)) Matter.Body.setVelocity(body, { x: body.velocity.x * .82, y: body.velocity.y * .82 });
    }
    const steps = Math.ceil(dt / (1000 / 60));
    for (let step = 0; step < steps; step++) Matter.Engine.update(engine, dt / steps);
    balls.forEach(({ element, body }) => { element.style.transform = `translate(${body.position.x - 20}px, ${body.position.y - 20}px) rotate(${body.angle}rad)`; });
    frame = requestAnimationFrame(tick);
  }
  function renderPool(animateOut = false) {
    const poolDrinks = candidates();
    const build = () => {
      stopPhysics();
      pool.replaceChildren();
      makePhysics();
      const shown = poolDrinks.length <= 28 ? poolDrinks : Array.from({ length: 28 }, (_, index) => poolDrinks[Math.floor(index * poolDrinks.length / 28)]);
      shown.forEach((drink, index) => {
        const element = document.createElement('span');
        element.className = 'gacha-ball';
        element.dataset.drinkId = drink.id;
        element.style.setProperty('--ball-color', colorFor(drink));
        element.setAttribute('aria-hidden', 'true');
        pool.append(element);
        if (engine) {
          const angle = index * 2.39996;
          const radius = Math.sqrt(index + .5) * 18;
          const body = Matter.Bodies.circle(141 + Math.cos(angle) * radius, 133 + Math.sin(angle) * radius, 20, { restitution: .72, frictionAir: .055, friction: .015, density: .0006 });
          Matter.Composite.add(engine.world, body);
          balls.push({ body, element, index });
        } else {
          const column = index % 6;
          const row = Math.floor(index / 6);
          element.style.transform = `translate(${22 + column * 41 + row % 2 * 10}px, ${43 + row * 42}px)`;
        }
      });
      if (engine && isOpen) frame = requestAnimationFrame(tick);
      updateControls();
    };
    if (animateOut && !reducedMotion.matches && pool.childElementCount) {
      const remaining = new Set(poolDrinks.map(drink => drink.id));
      pool.querySelectorAll('.gacha-ball').forEach(ball => {
        if (!remaining.has(ball.dataset.drinkId)) ball.classList.add('is-filtered');
      });
      schedule(build, 350);
    } else build();
  }
  function valuesFor(key) {
    if (key === 'flavors' || key === 'needs') return [...new Set(drinks.flatMap(drink => drink[key]))];
    const field = key === 'brands' ? 'brand' : 'category';
    return [...new Set(drinks.map(drink => drink[field]))];
  }
  function renderFilters() {
    filterGroups.innerHTML = Object.entries(labels).map(([key, title]) => `<div class="filter-row"><span class="filter-label">${title}</span><div class="filter-pills">${valuesFor(key).map(value => `<button class="filter-pill" type="button" data-filter-key="${key}" data-value="${window.drinkCardView.escapeHtml(value)}" aria-pressed="${draft[key].has(value)}">${window.drinkCardView.escapeHtml(value)}</button>`).join('')}</div></div>`).join('');
  }
  function openFilters() {
    if (isClosing || isDrawing) return;
    filterReturnFocus = document.activeElement;
    draft = Object.fromEntries(Object.entries(filters).map(([key, values]) => [key, new Set(values)]));
    repeatInput.checked = repeat;
    renderFilters();
    filterLayer.hidden = false;
    filterGroups.querySelector('button')?.focus({ preventScroll: true });
  }
  function closeFilters() {
    filterLayer.hidden = true;
    filterReturnFocus?.focus({ preventScroll: true });
  }
  function resetRound() {
    filters = selected();
    draft = selected();
    repeat = true;
    consumed = new Set();
    isDrawing = false;
    tray.replaceChildren();
    results.querySelectorAll('.gacha-reveal-card').forEach(card => card.remove());
    filterLayer.hidden = true;
  }
  function openGacha() {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    clearTimers();
    isClosing = false;
    isOpen = true;
    resetRound();
    layer.hidden = false;
    layer.setAttribute('aria-hidden', 'false');
    renderPool();
    requestAnimationFrame(() => layer.classList.add('is-open'));
    schedule(() => panel.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 820);
  }
  function closeGacha() {
    if (!isOpen || isClosing || !document.querySelector('#card-layer').hidden) return;
    isClosing = true;
    filterLayer.hidden = true;
    startButton.disabled = true;
    clearTimers();
    pool.classList.remove('is-shaking');
    const outletRect = outlet.getBoundingClientRect();
    tray.querySelectorAll('.gacha-capsule').forEach(capsule => {
      const rect = capsule.getBoundingClientRect();
      capsule.style.setProperty('--drop-x', `${outletRect.left + outletRect.width / 2 - rect.left - rect.width / 2}px`);
      capsule.style.setProperty('--drop-y', `${outletRect.top + outletRect.height / 2 - rect.top - rect.height / 2}px`);
      capsule.classList.add('is-retracting');
    });
    const retract = reducedMotion.matches ? 0 : 300;
    schedule(() => {
      layer.classList.remove('is-open');
      stopPhysics();
      window.dispatchEvent(new Event('gacha-close'));
    }, retract);
    schedule(() => {
      layer.hidden = true;
      layer.setAttribute('aria-hidden', 'true');
      isOpen = false;
      isClosing = false;
      resetRound();
      pool.replaceChildren();
      if (returnFocus?.isConnected && returnFocus !== document.body) returnFocus.focus({ preventScroll: true });
      else document.querySelector('#scene').focus({ preventScroll: true });
    }, retract + (reducedMotion.matches ? 0 : 830));
  }
  function draw() {
    const available = candidates();
    if (!available.length) { window.drinkCardView.showToast(emptyMessage); return; }
    if (isDrawing || isClosing) return;
    isDrawing = true;
    updateControls();
    const drink = available[Math.floor(Math.random() * available.length)];
    if (!repeat) consumed.add(drink.id);
    let selectedBall = null;
    if (!reducedMotion.matches) {
      pool.classList.add('is-shaking');
      shakeUntil = performance.now() + 750;
      balls.forEach(({ body, index }) => Matter.Body.applyForce(body, body.position, { x: Math.sin(index * 2.4) * .008, y: Math.cos(index * 3.1) * .008 }));
      schedule(() => {
        selectedBall = document.createElement('span');
        selectedBall.className = 'gacha-ball';
        selectedBall.style.zIndex = '3';
        selectedBall.style.setProperty('--ball-color', colorFor(drink));
        pool.append(selectedBall);
        selectedBall.animate([
          { transform: 'translate(120px, 105px) scale(1)', opacity: 1 },
          { transform: 'translate(120px, 270px) scale(.65)', opacity: 0 },
        ], { duration: 390, easing: 'cubic-bezier(.3,.65,.3,1)', fill: 'forwards' });
      }, 350);
    }
    const release = () => {
      selectedBall?.remove();
      pool.classList.remove('is-shaking');
      const capsule = document.createElement('button');
      capsule.type = 'button';
      capsule.className = 'gacha-capsule';
      capsule.dataset.drinkId = drink.id;
      capsule.setAttribute('aria-label', `打开${drink.name}扭蛋`);
      capsule.style.setProperty('--ball-color', colorFor(drink));
      capsule.innerHTML = '<span class="gacha-half" aria-hidden="true"></span><span class="gacha-half" aria-hidden="true"></span>';
      tray.append(capsule);
      const rect = capsule.getBoundingClientRect();
      const outletRect = outlet.getBoundingClientRect();
      capsule.style.setProperty('--drop-x', `${outletRect.left + outletRect.width / 2 - rect.left - rect.width / 2}px`);
      capsule.style.setProperty('--drop-y', `${outletRect.top + outletRect.height / 2 - rect.top - rect.height / 2}px`);
      if (!reducedMotion.matches) {
        capsule.classList.add('is-dropping');
        requestAnimationFrame(() => capsule.classList.remove('is-dropping'));
      }
      schedule(() => {
        isDrawing = false;
        renderPool();
        if (document.querySelector('#card-layer').hidden && document.activeElement === document.body) capsule.focus({ preventScroll: true });
      }, reducedMotion.matches ? 0 : 750);
    };
    schedule(release, reducedMotion.matches ? 0 : 720);
  }
  function openCapsule(capsule) {
    if (capsule.classList.contains('is-opening') || isClosing) return;
    const drink = drinks.find(item => item.id === capsule.dataset.drinkId);
    if (!drink) return;
    capsule.classList.add('is-opening');
    if (!reducedMotion.matches) schedule(() => {
      const reveal = document.createElement('div');
      reveal.className = `gacha-reveal-card drink-card ${window.drinkCardView.hasBrandLogo(drink) ? 'has-brand-logo' : ''}`;
      reveal.style.setProperty('--card-color', colorFor(drink));
      reveal.innerHTML = window.drinkCardView.cardMarkup(drink, true);
      const capsuleRect = capsule.getBoundingClientRect();
      const resultsRect = results.getBoundingClientRect();
      const offsetX = capsuleRect.left + capsuleRect.width / 2 - (resultsRect.left + resultsRect.width / 2);
      const offsetY = capsuleRect.top + capsuleRect.height / 2 - (resultsRect.top + resultsRect.height * .46);
      results.append(reveal);
      reveal.animate([
        { transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) scale(.12)`, opacity: 0 },
        { transform: 'translate(-50%, -50%) scale(.55)', opacity: 1 },
      ], { duration: 520, easing: 'cubic-bezier(.18,.85,.24,1.08)', fill: 'forwards' });
    }, 150);
    schedule(() => {
      window.dispatchEvent(new CustomEvent('drink-card-open', { detail: { drink, color: colorFor(drink) } }));
      capsule.remove();
      results.querySelectorAll('.gacha-reveal-card').forEach(element => element.remove());
    }, reducedMotion.matches ? 0 : 650);
  }
  layer.querySelector('.gacha-backdrop').addEventListener('click', closeGacha);
  document.querySelector('#gacha-filter-open').addEventListener('click', openFilters);
  startButton.addEventListener('click', draw);
  results.addEventListener('click', event => { const capsule = event.target.closest('.gacha-capsule'); if (capsule) openCapsule(capsule); });
  filterGroups.addEventListener('click', event => {
    const button = event.target.closest('[data-filter-key]');
    if (!button) return;
    const values = draft[button.dataset.filterKey];
    values.has(button.dataset.value) ? values.delete(button.dataset.value) : values.add(button.dataset.value);
    button.setAttribute('aria-pressed', String(values.has(button.dataset.value)));
  });
  document.querySelector('#gacha-filter-reset').addEventListener('click', () => { draft = selected(); renderFilters(); });
  document.querySelector('#gacha-filter-apply').addEventListener('click', () => {
    filters = draft;
    repeat = repeatInput.checked;
    closeFilters();
    renderPool(true);
  });
  document.querySelector('.gacha-filter-backdrop').addEventListener('click', closeFilters);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !isOpen || !document.querySelector('#card-layer').hidden) return;
    if (!filterLayer.hidden) closeFilters(); else closeGacha();
  });
  window.addEventListener('drink-library-ready', event => {
    drinks = event.detail.drinks;
    colorFor = event.detail.colorFor;
    if (!filterLayer.hidden) renderFilters();
    if (isOpen) renderPool();
  });
  window.addEventListener('cart-stage', event => {
    if (event.detail.name === 'gacha') openGacha();
    else if (isOpen && !isClosing) {
      clearTimers();
      stopPhysics();
      layer.classList.remove('is-open');
      layer.hidden = true;
      layer.setAttribute('aria-hidden', 'true');
      isOpen = false;
      resetRound();
    }
  });
  if (new URLSearchParams(location.search).get('focus') === 'gacha') openGacha();
})();
