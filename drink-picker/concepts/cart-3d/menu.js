(() => {
  const layer = document.querySelector('#menu-layer');
  let bookRoot = document.querySelector('#book-pages');
  const categoryRoot = document.querySelector('#category-filters');
  const brandRoot = document.querySelector('#brand-filters');
  const status = document.querySelector('#page-status');
  const count = document.querySelector('#menu-count');
  const previous = document.querySelector('#page-prev');
  const next = document.querySelector('#page-next');
  const selected = { categories: new Set(), brands: new Set() };
  const colors = ['#fdf4b5', '#a9df71', '#febac4', '#e3d2ed', '#f8d5c0'];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const libraryError = document.querySelector('#library-error');
  let drinks = [];
  let flip = null;
  let closeTimer = null;
  let openingTimer = null;
  let isOpen = false;
  let returnFocus = null;
  let dataReady = false;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const filtered = () => drinks.filter(drink =>
    (!selected.categories.size || selected.categories.has(drink.category)) &&
    (!selected.brands.size || selected.brands.has(drink.brand))
  );

  function renderPills(root, values, key) {
    root.innerHTML = values.map(value => `<button class="filter-pill" type="button" data-filter="${key}" data-value="${escapeHtml(value)}" aria-pressed="${selected[key].has(value)}">${escapeHtml(value)}</button>`).join('');
  }
  function renderFilters() {
    renderPills(categoryRoot, [...new Set(drinks.map(drink => drink.category))], 'categories');
    renderPills(brandRoot, [...new Set(drinks.map(drink => drink.brand))], 'brands');
  }
  function colorFor(drink) {
    let hash = 0;
    for (const character of drink.id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    return colors[hash % colors.length];
  }
  function renderEntry(drink) {
    const titleSize = drink.name.length > 7 ? 14 : drink.name.length > 4 ? 16 : 20;
    return `<button class="drink-entry" type="button" data-drink="${escapeHtml(drink.id)}" style="--card-color:${colorFor(drink)}" aria-label="打开${escapeHtml(drink.name)}详情"><span class="spark" aria-hidden="true">✦</span><strong style="font-size:${titleSize}px">${escapeHtml(drink.name)}</strong><span class="flavor-tags">${drink.flavors.slice(0, 2).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</span></button>`;
  }
  function renderPages() {
    flip?.destroy();
    flip = null;
    const stage = document.querySelector('.book-stage');
    stage.innerHTML = '<div id="book-pages"></div>';
    bookRoot = stage.querySelector('#book-pages');
    const matches = filtered();
    count.textContent = `${matches.length} 款饮品`;
    const pageCount = Math.max(2, Math.ceil(matches.length / 16) * 2);
    for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
      const page = document.createElement('div');
      page.className = 'drink-page';
      const items = matches.slice(pageIndex * 8, pageIndex * 8 + 8);
      page.innerHTML = `<div class="page-content"><div class="page-eyebrow"><span>${pageIndex % 2 ? 'DRINK INDEX' : 'CUP SELECTION'}</span><span>${String(pageIndex + 1).padStart(2, '0')}</span></div>${matches.length ? `<div class="page-drinks">${items.map(renderEntry).join('')}</div>` : pageIndex === 0 ? `<div class="page-empty">✦<br>暂时没有找到这款饮品，换个条件试试吧</div>` : ''}</div>`;
      bookRoot.append(page);
    }
    const pageWidth = Math.floor((stage.clientWidth - 44) / 2);
    const pageHeight = Math.floor(stage.clientHeight - 13);
    flip = new St.PageFlip(bookRoot, {
      width: pageWidth,
      height: pageHeight,
      size: 'fixed',
      showCover: false,
      usePortrait: false,
      drawShadow: true,
      maxShadowOpacity: .28,
      flippingTime: reducedMotion.matches ? 0 : 750,
      disableFlipByClick: true,
      useMouseEvents: false,
    });
    flip.on('flip', updatePageStatus);
    flip.loadFromHTML(bookRoot.querySelectorAll('.drink-page'));
    updatePageStatus();
  }
  function fitVisibleEntries() {
    bookRoot.querySelectorAll('.drink-entry').forEach(entry => {
      if (!entry.getBoundingClientRect().width) return;
      const title = entry.querySelector('strong');
      const tags = entry.querySelector('.flavor-tags');
      let size = 20;
      title.style.fontSize = `${size}px`;
      while (tags.getBoundingClientRect().bottom > entry.getBoundingClientRect().bottom - 4 && size > 10) {
        title.style.fontSize = `${--size}px`;
      }
    });
  }
  function updatePageStatus() {
    if (!flip) return;
    const spread = Math.floor(flip.getCurrentPageIndex() / 2) + 1;
    const total = Math.ceil(flip.getPageCount() / 2);
    status.textContent = `${spread} / ${total}`;
    previous.disabled = spread <= 1;
    next.disabled = spread >= total;
    requestAnimationFrame(fitVisibleEntries);
  }
  function openMenu() {
    clearTimeout(closeTimer);
    if (isOpen) return;
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    isOpen = true;
    layer.classList.add('is-visible');
    layer.setAttribute('aria-hidden', 'false');
    if (dataReady) renderPages();
    else count.textContent = '正在载入饮品';
    requestAnimationFrame(() => layer.classList.add('is-open'));
    openingTimer = setTimeout(() => categoryRoot.querySelector('button')?.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 850);
  }
  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    clearTimeout(openingTimer);
    layer.classList.remove('is-open');
    window.dispatchEvent(new Event('menu-close'));
    if (returnFocus?.isConnected && returnFocus !== document.body) returnFocus.focus({ preventScroll: true });
    else document.querySelector('#scene').focus({ preventScroll: true });
    closeTimer = setTimeout(() => {
      layer.classList.remove('is-visible');
      layer.setAttribute('aria-hidden', 'true');
    }, reducedMotion.matches ? 0 : 850);
  }
  window.addEventListener('menu-open', openMenu);
  window.addEventListener('cart-stage', event => {
    if (event.detail.name !== 'menu' && isOpen) closeMenu();
  });
  document.querySelector('.menu-backdrop').addEventListener('click', closeMenu);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isOpen && document.querySelector('#card-layer').hidden) closeMenu();
  });
  layer.addEventListener('click', event => {
    const filter = event.target.closest('[data-filter]');
    if (filter) {
      const values = selected[filter.dataset.filter];
      values.has(filter.dataset.value) ? values.delete(filter.dataset.value) : values.add(filter.dataset.value);
      renderFilters();
      renderPages();
      [...layer.querySelectorAll('[data-filter]')].find(button => button.dataset.filter === filter.dataset.filter && button.dataset.value === filter.dataset.value)?.focus({ preventScroll: true });
      return;
    }
    const drinkButton = event.target.closest('[data-drink]');
    if (drinkButton) {
      const drink = drinks.find(item => item.id === drinkButton.dataset.drink);
      if (drink) window.dispatchEvent(new CustomEvent('drink-card-open', { detail: { drink, color: colorFor(drink) } }));
    }
  });
  document.querySelector('#reset-filters').addEventListener('click', () => {
    selected.categories.clear();
    selected.brands.clear();
    renderFilters();
    renderPages();
  });
  previous.addEventListener('click', () => flip?.flipPrev('bottom'));
  next.addEventListener('click', () => flip?.flipNext('bottom'));
  function loadDrinks() {
    libraryError.hidden = true;
    fetch('../../drinks.draft.json').then(response => {
      if (!response.ok) throw new Error('饮品数据加载失败');
      return response.json();
    }).then(data => {
      if (!Array.isArray(data.drinks)) throw new Error('饮品数据格式错误');
      drinks = data.drinks;
      dataReady = true;
      renderFilters();
      if (isOpen) renderPages();
      window.dispatchEvent(new CustomEvent('drink-library-ready', { detail: { drinks, colorFor } }));
    }).catch(() => {
      count.textContent = '饮品数据暂时无法加载';
      libraryError.hidden = false;
    });
  }
  document.querySelector('#library-retry').addEventListener('click', loadDrinks);
  loadDrinks();
  if (new URLSearchParams(location.search).get('focus') === 'menu') openMenu();
})();
