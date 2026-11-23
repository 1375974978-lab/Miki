(() => {
  const layer = document.querySelector('#ranking-layer');
  const board = layer.querySelector('.ranking-board');
  const tabs = document.querySelector('#ranking-tabs');
  const content = document.querySelector('#ranking-content');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const escapeHtml = value => window.drinkCardView.escapeHtml(value);
  const lists = [
    {
      id: 'tea', name: '茶香派', lead: '想喝得到茶味', note: '茶香作主角，奶感和花香各有轻重。',
      items: [
        ['chagee-boya', '茉莉茶香清楚，奶感轻盈'],
        ['yidiandian-four-seasons-milk-green', '四季春茶底，入口清爽'],
        ['guming-jasmine-milk-tea', '花香与奶香都能尝到'],
        ['chabaidao-jasmine-milk-green', '茉莉花香搭配柔和奶感'],
      ],
    },
    {
      id: 'fresh', name: '清爽派', lead: '想喝得轻快', note: '果香和酸甜明显，适合偏爱冰爽口感的人。',
      items: [
        ['heytea-grape', '葡萄果香饱满，酸甜清爽'],
        ['nayuki-orange', '橙香明亮，口感偏清透'],
        ['chabaidao-green-grape-jasmine', '青提果香中带茉莉茶香'],
        ['liruotao-kiwi-cucumber-yogurt', '青瓜猕猴桃与酸奶的清新搭配'],
      ],
    },
    {
      id: 'treat', name: '甜点派', lead: '想喝点有满足感的', note: '奶香、果香和丰富口感，留给想喝甜点感的一杯。',
      items: [
        ['heytea-mango-cheese', '芒果配奶盖，像水果甜点'],
        ['guming-pudding-milk-tea', '布蕾与奶芙带来浓郁口感'],
        ['nayuki-strawberry-cheese', '草莓酸甜搭配芝士顶'],
        ['starbucks-mocha', '巧克力风味与咖啡香，口感浓郁'],
      ],
    },
  ];
  let drinks = [];
  let colorFor = () => '#fdf4b5';
  let selected = 0;
  let isOpen = false;
  let closeTimer = null;
  let returnFocus = null;

  function render() {
    tabs.innerHTML = lists.map((list, index) => `<button id="ranking-tab-${list.id}" type="button" role="tab" aria-selected="${index === selected}" aria-controls="ranking-content" tabindex="${index === selected ? 0 : -1}" data-rank-tab="${index}"><span>0${index + 1}</span>${list.name}</button>`).join('');
    const list = lists[selected];
    content.setAttribute('aria-labelledby', `ranking-tab-${list.id}`);
    const byId = new Map(drinks.map(drink => [drink.id, drink]));
    const rows = list.items.map(([id, reason], index) => {
      const drink = byId.get(id);
      if (!drink) return '';
      return `<button class="ranking-row" type="button" data-rank-drink="${escapeHtml(id)}" style="--rank-color:${colorFor(drink)}" aria-label="查看${escapeHtml(drink.brand)}${escapeHtml(drink.name)}饮品小卡"><span class="ranking-number">${String(index + 1).padStart(2, '0')}</span><span class="ranking-row-copy"><strong>${escapeHtml(drink.name)}</strong><span class="ranking-meta">${escapeHtml(drink.brand)} <i aria-hidden="true">/</i> ${escapeHtml(drink.category)} <i aria-hidden="true">/</i> ${escapeHtml(drink.flavors.slice(0, 2).join(' · '))}</span><span class="ranking-reason">${escapeHtml(reason)}</span></span><span class="ranking-price">¥${drink.priceMin}–${drink.priceMax}<small>参考价</small></span><span class="ranking-arrow" aria-hidden="true">↗</span></button>`;
    }).join('');
    content.innerHTML = `<div class="ranking-list-head"><div><span class="ranking-list-index">TASTE LIST / 0${selected + 1}</span><h3>${list.lead}</h3></div><p>${list.note}</p></div><div class="ranking-rows">${rows || '<p class="ranking-empty">饮品数据暂时无法加载</p>'}</div>`;
  }
  function open() {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    clearTimeout(closeTimer);
    selected = 0;
    render();
    isOpen = true;
    layer.hidden = false;
    layer.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => layer.classList.add('is-open'));
    closeTimer = setTimeout(() => board.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 620);
  }
  function close() {
    if (!isOpen || !document.querySelector('#card-layer').hidden) return;
    isOpen = false;
    clearTimeout(closeTimer);
    layer.classList.remove('is-open');
    window.dispatchEvent(new Event('ranking-close'));
    closeTimer = setTimeout(() => {
      layer.hidden = true;
      layer.setAttribute('aria-hidden', 'true');
      if (returnFocus?.isConnected && returnFocus !== document.body) returnFocus.focus({ preventScroll: true });
      else document.querySelector('#scene').focus({ preventScroll: true });
    }, reducedMotion.matches ? 0 : 760);
  }
  tabs.addEventListener('click', event => {
    const tab = event.target.closest('[data-rank-tab]');
    if (!tab) return;
    selected = Number(tab.dataset.rankTab);
    render();
    tabs.querySelector('[aria-selected="true"]')?.focus({ preventScroll: true });
  });
  tabs.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    selected = event.key === 'Home' ? 0 : event.key === 'End' ? lists.length - 1 : (selected + (event.key === 'ArrowRight' ? 1 : -1) + lists.length) % lists.length;
    render();
    tabs.querySelector('[aria-selected="true"]')?.focus({ preventScroll: true });
  });
  content.addEventListener('click', event => {
    const button = event.target.closest('[data-rank-drink]');
    const drink = drinks.find(item => item.id === button?.dataset.rankDrink);
    if (drink) window.dispatchEvent(new CustomEvent('drink-card-open', { detail: { drink, color: colorFor(drink) } }));
  });
  layer.querySelector('.ranking-backdrop').addEventListener('click', close);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isOpen && document.querySelector('#card-layer').hidden) close();
  });
  window.addEventListener('drink-library-ready', event => {
    drinks = event.detail.drinks;
    colorFor = event.detail.colorFor;
    if (isOpen) render();
  });
  window.addEventListener('cart-stage', event => {
    if (event.detail.name === 'ranking') open();
    else if (isOpen) {
      clearTimeout(closeTimer);
      isOpen = false;
      layer.classList.remove('is-open');
      layer.hidden = true;
      layer.setAttribute('aria-hidden', 'true');
    }
  });
  if (new URLSearchParams(location.search).get('focus') === 'ranking') open();
})();
