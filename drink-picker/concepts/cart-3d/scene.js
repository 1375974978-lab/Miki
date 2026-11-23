(() => {
  const mount = document.querySelector('#scene');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#fff9f2');

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.NoToneMapping;
  mount.append(renderer.domElement);
  const ribbons = Object.fromEntries([...document.querySelectorAll('.prop-label')].map(element => [element.dataset.prop, element]));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const camera = new THREE.OrthographicCamera(-7.7, 7.7, 4.8, -4.8, .1, 100);
  const home = { position: new THREE.Vector3(-6.3, 5.9, 14.8), target: new THREE.Vector3(-.35, 2.25, 0), zoom: 1 };
  const bar = { position: new THREE.Vector3(-2.0, 4.8, 10.4), target: new THREE.Vector3(1.18, 3.32, 1.85), zoom: 1.75 };
  const entrance = { position: new THREE.Vector3(9.5, 9.2, 11.2), target: new THREE.Vector3(1.0, 3.2, .1), zoom: .92 };
  const views = {
    menu: { position: new THREE.Vector3(-2.3, 4.1, 8.8), target: new THREE.Vector3(-1.12, 3.06, 2.04), zoom: 3.5 },
    gacha: { position: new THREE.Vector3(-1.1, 4.15, 9.2), target: new THREE.Vector3(.25, 3.16, 1.98), zoom: 3.5 },
    ranking: { position: new THREE.Vector3(.8, 4.5, 9.2), target: new THREE.Vector3(2.12, 3.34, 1.88), zoom: 3.45 },
    tin: { position: new THREE.Vector3(1.8, 4.0, 8.7), target: new THREE.Vector3(3.38, 2.76, 1.98), zoom: 3.7 },
  };
  camera.position.copy(reducedMotion.matches ? bar.position : entrance.position);
  const look = (reducedMotion.matches ? bar.target : entrance.target).clone();
  camera.zoom = reducedMotion.matches ? bar.zoom : entrance.zoom;
  camera.updateProjectionMatrix();
  camera.lookAt(look);
  let currentView = bar;
  let activeMove = null;
  let stage = 'bar';
  let focusName = '';
  let hoverName = '';

  const mat = (color, roughness = .78, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const cream = mat('#f8e7d7', .68);
  const warmWhite = mat('#fff7ed', .83);
  const pink = mat('#edabc0', .88);
  const deepPink = mat('#ce7795', .66);
  const wine = mat('#672238', .64);
  const wineDark = mat('#3b2330', .93);
  const cherry = mat('#c94e62', .64);
  const teal = mat('#b4d9d8', .26);
  const mint = mat('#d7e8bc', .86);
  const gold = mat('#d5a560', .34, .55);
  const walnut = mat('#966346', .72);
  const woodDark = mat('#714333', .8);
  const tire = mat('#333237', .86);
  const tread = mat('#28272d', .94);
  const lilac = mat('#d9d3ed', .76);
  const orange = mat('#ebad78', .75);
  const capsuleColors = ['#d94d69', '#e2b44c', '#8d79bd', '#79bb9d'].map(color => new THREE.MeshBasicMaterial({ color }));

  function add(geometry, material, parent, x = 0, y = 0, z = 0) {
    const item = new THREE.Mesh(geometry, material);
    item.position.set(x, y, z);
    item.castShadow = true;
    item.receiveShadow = true;
    parent.add(item);
    return item;
  }
  function box(parent, material, w, h, d, x, y, z) {
    return add(new THREE.BoxGeometry(w, h, d), material, parent, x, y, z);
  }
  function roundShape(w, h, r) {
    const x = -w / 2, y = -h / 2;
    const s = new THREE.Shape();
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  function rounded(parent, material, w, h, d, r, x, y, z, bevel = .045) {
    const geo = new THREE.ExtrudeGeometry(roundShape(w, h, r), {
      depth: d, bevelEnabled: true, bevelSegments: 3, steps: 1,
      bevelSize: bevel, bevelThickness: bevel, curveSegments: 10,
    });
    geo.translate(0, 0, -d / 2);
    return add(geo, material, parent, x, y, z);
  }
  function sphere(parent, material, r, x, y, z, sx = 1, sy = 1, sz = 1) {
    const item = add(new THREE.SphereGeometry(r, 24, 16), material, parent, x, y, z);
    item.scale.set(sx, sy, sz);
    return item;
  }
  function cylinder(parent, material, rt, rb, h, x, y, z, segments = 32) {
    return add(new THREE.CylinderGeometry(rt, rb, h, segments), material, parent, x, y, z);
  }
  function tube(parent, material, points, radius = .025) {
    const path = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    return add(new THREE.TubeGeometry(path, 28, radius, 8, false), material, parent);
  }
  function focusGroup(name) {
    const group = new THREE.Group();
    group.userData.focus = name;
    scene.add(group);
    return group;
  }

  scene.add(new THREE.HemisphereLight('#ffffff', '#c9aeb0', .55));
  const key = new THREE.DirectionalLight('#fff5df', 1.25);
  key.position.set(-6, 10, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -12;
  key.shadow.camera.right = 12;
  key.shadow.camera.top = 12;
  key.shadow.camera.bottom = -12;
  key.shadow.normalBias = .025;
  key.shadow.radius = 4;
  scene.add(key);
  const fill = new THREE.DirectionalLight('#c6e3e8', .27);
  fill.position.set(5, 6, -6);
  scene.add(fill);

  const ground = add(new THREE.PlaneGeometry(200, 200), mat('#fff9f2', 1), scene, 0, -.04, 0);
  ground.rotation.x = -Math.PI / 2;
  ground.castShadow = false;

  const cart = new THREE.Group();
  scene.add(cart);

  rounded(cart, cream, 7.25, 3.25, 2.28, .42, 1.05, 2.33, 0, .13);
  rounded(cart, wine, 7.09, 3.06, .08, .34, 1.05, 2.32, 1.18, .035);
  rounded(cart, cream, 6.96, 2.92, .08, .30, 1.05, 2.32, 1.27, .025);
  rounded(cart, wine, 7.04, .23, 2.34, .06, 1.05, .95, .015, .025);
  rounded(cart, pink, 7.0, .57, 2.32, .09, 1.05, 1.29, .02, .025);
  rounded(cart, cream, 7.0, .16, 2.34, .04, 1.05, 1.69, .025, .018);
  rounded(cart, wine, 6.75, .38, .075, .075, 1.05, 1.22, 1.36, .02);
  rounded(cart, pink, 6.65, .29, .08, .065, 1.05, 1.22, 1.42, .015);
  box(cart, gold, 6.51, .035, .035, 1.05, 1.41, 1.48);
  for (let i = 0; i < 15; i++) {
    const x = -2.05 + i * .44;
    box(cart, i % 2 ? warmWhite : deepPink, .21, .23, .032, x, 1.22, 1.49);
  }
  for (const x of [-2.17, 4.24]) {
    sphere(cart, gold, .05, x, 1.75, 1.39, 1, 1, .35);
    sphere(cart, gold, .05, x, 2.02, 1.39, 1, 1, .35);
  }

  rounded(cart, deepPink, 2.85, 2.5, 2.22, .51, -3.78, 1.95, -.03, .11);
  rounded(cart, pink, 2.67, 2.36, 2.23, .46, -3.82, 1.98, .045, .06);
  rounded(cart, wine, 2.54, 2.2, .07, .39, -3.82, 1.98, 1.17, .025);
  rounded(cart, pink, 2.40, 2.06, .08, .35, -3.82, 1.98, 1.25, .02);
  rounded(cart, deepPink, 1.26, 1.02, 2.16, .34, -5.16, 1.35, -.05, .08);
  rounded(cart, pink, 1.14, .91, 2.18, .3, -5.18, 1.39, .015, .045);
  rounded(cart, wine, 1.97, 1.1, .09, .25, -3.95, 2.35, 1.37, .03);
  rounded(cart, teal, 1.83, .97, .08, .21, -3.95, 2.37, 1.45, .025);
  box(cart, warmWhite, .075, .77, .018, -4.47, 2.39, 1.52).rotation.z = -.08;
  rounded(cart, wine, .39, .06, .07, .025, -2.96, 1.66, 1.39, .01);
  rounded(cart, gold, .33, .23, .1, .08, -5.66, 1.34, 1.04, .02);
  sphere(cart, warmWhite, .16, -5.69, 1.34, 1.12, 1, .65, .3);
  rounded(cart, wine, .45, .09, .06, .035, -5.30, 1.03, 1.20, .012);
  rounded(cart, warmWhite, .32, .31, .04, .08, -3.02, 1.17, 1.32, .015);
  sphere(cart, gold, .05, -3.02, 1.17, 1.37, 1, 1, .35);

  function wheel(x) {
    const group = new THREE.Group();
    group.position.set(x, .76, 1.28);
    cart.add(group);
    add(new THREE.CylinderGeometry(.72, .72, .38, 56), tire, group, 0, 0, .12).rotation.x = Math.PI / 2;
    for (let i = 0; i < 28; i++) {
      const angle = i * Math.PI * 2 / 28;
      const block = box(group, tread, .17, .11, .41, Math.cos(angle) * .71, Math.sin(angle) * .71, .12);
      block.rotation.z = angle + Math.PI / 2;
    }
    add(new THREE.TorusGeometry(.58, .13, 12, 56), tread, group, 0, 0, .34);
    add(new THREE.CylinderGeometry(.43, .43, .055, 48), wine, group, 0, 0, .39).rotation.x = Math.PI / 2;
    add(new THREE.CylinderGeometry(.32, .32, .065, 48), cream, group, 0, 0, .44).rotation.x = Math.PI / 2;
    add(new THREE.TorusGeometry(.25, .022, 8, 42), gold, group, 0, 0, .49);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      sphere(group, gold, .034, Math.cos(a) * .17, Math.sin(a) * .17, .50, 1, 1, .35);
    }
    sphere(group, gold, .075, 0, 0, .50, 1, 1, .45);
  }
  wheel(-3.85);
  wheel(3.16);

  rounded(cart, wine, 5.57, 1.76, .08, .16, 1.22, 2.95, 1.18, .04);
  rounded(cart, walnut, 5.37, 1.57, .07, .11, 1.22, 2.95, 1.25, .025);
  rounded(cart, wineDark, 5.17, 1.43, .06, .08, 1.22, 2.96, 1.31, .025);
  box(cart, walnut, 5.14, .09, .52, 1.22, 3.25, 1.53);
  box(cart, woodDark, 5.14, .075, .55, 1.22, 3.21, 1.53);
  for (const x of [-1.48, 3.91]) {
    rounded(cart, cream, .17, 1.63, .16, .04, x, 2.94, 1.36, .02);
  }
  for (const x of [-1.2, 3.63]) {
    box(cart, gold, .065, .22, .28, x, 2.18, 1.56);
  }
  rounded(cart, woodDark, 6.06, .28, 1.02, .08, 1.18, 2.22, 1.68, .04);
  rounded(cart, walnut, 6.18, .16, 1.1, .05, 1.18, 2.42, 1.7, .035);
  box(cart, gold, 6.0, .045, .035, 1.18, 2.32, 2.26);

  for (let i = 0; i < 8; i++) {
    const x = -2.13 + i * .94;
    const stripe = i % 2 ? cream : deepPink;
    rounded(cart, stripe, .94, .19, 2.65, .055, x, 4.23, .52, .025);
    sphere(cart, stripe, .31, x, 4.00, 1.89, 1.48, .53, .36);
  }
  rounded(cart, wine, 7.62, .09, 2.79, .045, 1.17, 4.04, .52, .016);
  box(cart, gold, .07, .48, .09, -2.38, 3.81, 1.88);
  box(cart, gold, .07, .48, .09, 4.7, 3.81, 1.88);
  box(cart, gold, 7.6, .045, .045, 1.17, 4.35, 1.95);
  for (let i = 0; i < 7; i++) sphere(cart, gold, .046, -1.65 + i * .94, 3.92, 1.99, 1, 1, .6);
  const roofSign = new THREE.Group();
  roofSign.position.set(-.48, 4.76, .86);
  cart.add(roofSign);
  const letterGold = mat('#c7954d', .35, .5);
  const letterCream = mat('#fff8e8', .38);
  function signStroke(points) {
    for (const [material, radius, z] of [[letterGold, .115, 0], [letterCream, .078, .067]]) {
      const path = new THREE.CatmullRomCurve3(points.map(([x, y]) => new THREE.Vector3(x, y, z)));
      add(new THREE.TubeGeometry(path, Math.max(20, points.length * 7), radius, 12, false), material, roofSign);
      for (const [x, y] of [points[0], points[points.length - 1]]) {
        sphere(roofSign, material, radius, x, y, z);
      }
    }
  }
  function signDot(x, y, radius = .105) {
    sphere(roofSign, letterGold, radius, x, y, 0);
    sphere(roofSign, letterCream, radius * .68, x, y, .067);
  }
  // Each letter is dimensional geometry, so its side profile follows the camera.
  signStroke([[.08, .03], [.08, .76]]);
  signStroke([[.08, .76], [.36, .76], [.61, .66], [.70, .40], [.61, .14], [.36, .03], [.08, .03]]);
  signStroke([[.88, .03], [.88, .48]]);
  signStroke([[.88, .37], [.99, .49], [1.12, .50]]);
  signStroke([[1.30, .03], [1.30, .48]]);
  signDot(1.30, .69, .09);
  signStroke([[1.52, .03], [1.52, .48]]);
  signStroke([[1.53, .37], [1.68, .50], [1.88, .48], [1.99, .34], [1.99, .03]]);
  signStroke([[2.22, .03], [2.22, .76]]);
  signStroke([[2.24, .25], [2.65, .52]]);
  signStroke([[2.42, .34], [2.69, .03]]);
  signStroke([[2.89, .56], [2.98, .73], [3.16, .75], [3.32, .64], [3.29, .48], [3.14, .37], [3.11, .26]]);
  signDot(3.11, .06);
  for (const x of [.08, 2.22, 3.11]) {
    cylinder(cart, gold, .024, .024, .35, roofSign.position.x + x, 4.61, roofSign.position.z - .035, 12);
    sphere(cart, gold, .045, roofSign.position.x + x, 4.43, roofSign.position.z - .035, 1, .45, 1);
  }

  function cup(x, color, y = 3.47, z = 1.55, scale = 1) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    group.scale.setScalar(scale);
    cart.add(group);
    cylinder(group, color, .19, .15, .49, 0, 0, 0, 24);
    cylinder(group, cream, .205, .205, .045, 0, .255, 0, 24);
    cylinder(group, gold, .016, .016, .42, .08, .48, 0, 10).rotation.z = .15;
    sphere(group, wine, .032, 0, -.13, .145, 1, 1, .35);
    sphere(group, wine, .032, -.08, -.09, .14, 1, 1, .35);
    return group;
  }
  cup(-1.08, deepPink, 3.5, 1.53, .8);
  cup(-.63, mint, 3.5, 1.53, .72);
  cup(3.45, orange, 3.5, 1.53, .72);

  const menu = focusGroup('menu');
  const book = rounded(menu, wine, .94, 1.12, .16, .075, -1.15, 3.02, 1.97, .025);
  book.rotation.z = .11;
  const cover = rounded(menu, cream, .83, 1.02, .16, .055, -1.15, 3.025, 2.08, .02);
  cover.rotation.z = .11;
  box(menu, gold, .045, 1.0, .03, -1.53, 3.02, 2.18).rotation.z = .11;
  sphere(menu, cherry, .20, -1.15, 3.21, 2.20, .79, 1, .16);
  box(menu, warmWhite, .24, .13, .045, -1.15, 3.12, 2.24);
  for (let i = 0; i < 3; i++) box(menu, wine, .44 - i * .045, .025, .015, -1.13, 2.84 - i * .12, 2.2);
  rounded(menu, woodDark, .65, .075, .36, .025, -1.15, 2.45, 1.92, .015);

  const gacha = focusGroup('gacha');
  const gachaMetal = mat('#b8a993', .48, .38);
  rounded(gacha, gachaMetal, .91, .67, .58, .12, .18, 2.74, 1.95, .035);
  rounded(gacha, cream, .80, .57, .59, .1, .18, 2.77, 2.01, .035);
  rounded(gacha, warmWhite, .55, .13, .045, .04, .18, 2.96, 2.34, .012);
  for (const [x, material] of [[.02, warmWhite], [.34, mint]]) rounded(gacha, material, .20, .10, .045, .025, x, 2.77, 2.36, .008);
  add(new THREE.TorusGeometry(.14, .043, 10, 32), gachaMetal, gacha, .18, 2.54, 2.36);
  for (const [x, y, z, material] of [
    [-.04, 3.27, 2.21, capsuleColors[0]], [.36, 3.28, 2.23, capsuleColors[1]], [.03, 3.54, 2.28, capsuleColors[2]], [.38, 3.59, 2.19, capsuleColors[3]],
  ]) sphere(gacha, material, .13, x, y, z, 1, .88, .75);
  const glass = new THREE.MeshPhysicalMaterial({ color: '#c9ebed', roughness: .12, metalness: 0, transparent: true, opacity: .38, side: THREE.FrontSide, depthWrite: false });
  sphere(gacha, glass, .50, .18, 3.43, 2.01, 1, 1, .9);
  rounded(gacha, gold, .56, .055, .32, .02, .18, 2.43, 1.98, .012);

  const ranking = focusGroup('ranking');
  rounded(ranking, woodDark, 1.22, 1.38, .17, .07, 2.19, 3.10, 1.74, .025);
  rounded(ranking, wineDark, 1.07, 1.22, .17, .04, 2.19, 3.10, 1.85, .018);
  for (let i = 0; i < 3; i++) {
    sphere(ranking, gold, .055, 1.82, 3.40 - i * .30, 1.98, 1, 1, .35);
    box(ranking, i === 0 ? warmWhite : gold, .48 - i * .06, .026, .02, 2.17, 3.40 - i * .30, 1.98);
  }
  sphere(ranking, deepPink, .11, 2.24, 2.75, 1.97, 1, .2, .3);

  const tin = focusGroup('tin');
  const tinMetal = mat('#b5a58c', .46, .46);
  const tinTrim = mat('#81705b', .38, .58);
  rounded(tin, tinTrim, 1.19, .65, .28, .09, 3.49, 2.78, 2.02, .025);
  rounded(tin, tinMetal, 1.12, .57, .29, .07, 3.49, 2.8, 2.07, .018);
  rounded(tin, cream, 1.02, .46, .02, .04, 3.49, 2.81, 2.23, .008);
  rounded(tin, gold, 1.23, .07, .32, .025, 3.49, 2.47, 2.02, .01);
  const tinLid = new THREE.Group();
  tinLid.position.set(3.49, 3.11, 2.21);
  tin.add(tinLid);
  rounded(tinLid, tinTrim, 1.19, .64, .13, .08, 0, -.32, .025, .02);
  rounded(tinLid, tinMetal, 1.1, .56, .05, .06, 0, -.32, .11, .012);
  rounded(tinLid, cream, .6, .29, .015, .05, 0, -.32, .15, .006);
  sphere(tinLid, wine, .085, 0, -.32, .17, 1, 1, .17);
  box(tin, tinTrim, 1.05, .045, .04, 3.49, 3.12, 2.15);

  const focusables = { menu, gacha, ranking, tin };
  const labelPoints = {
    menu: new THREE.Vector3(-1.15, 2.45, 2.62),
    gacha: new THREE.Vector3(.18, 2.42, 2.62),
    ranking: new THREE.Vector3(2.19, 2.42, 2.48),
    tin: new THREE.Vector3(3.49, 2.43, 2.6),
  };
  rounded(menu, walnut, .82, .08, .55, .035, -1.15, 2.39, 2.06, .012);
  rounded(gacha, wine, .98, .08, .68, .035, .18, 2.39, 2.04, .012);
  rounded(ranking, walnut, 1.32, .08, .47, .035, 2.19, 2.39, 1.93, .012);
  // Move each prop as one unit so the hover scale grows around the prop, not the world origin.
  function seat(group, center, lift, forward) {
    group.children.forEach(child => child.position.sub(center));
    group.position.copy(center).add(new THREE.Vector3(0, lift, forward));
    group.userData.restY = group.position.y;
    group.traverse(child => {
      if (!child.isMesh) return;
      child.material = child.material.clone();
      if (child.material.emissive) child.material.emissive.set('#ef91ad');
      if (child.material.emissiveIntensity !== undefined) child.material.emissiveIntensity = 0;
    });
    const glow = new THREE.PointLight('#f9afca', 0, 2.0, 2);
    glow.position.set(0, .1, .55);
    group.add(glow);
    group.userData.glow = glow;
  }
  seat(menu, new THREE.Vector3(-1.15, 3.02, 2.04), .15, .12);
  seat(gacha, new THREE.Vector3(.18, 3.15, 2.04), .15, .14);
  seat(ranking, new THREE.Vector3(2.19, 3.1, 1.9), .15, .24);
  seat(tin, new THREE.Vector3(3.49, 2.85, 2.2), 0, 0);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function setPointer(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
  }
  function hitName(event) {
    setPointer(event);
    const hits = raycaster.intersectObjects(Object.values(focusables), true);
    let object = hits[0]?.object;
    while (object && !object.userData.focus) object = object.parent;
    return object?.userData.focus || '';
  }
  function hitCart(event) {
    setPointer(event);
    return raycaster.intersectObjects(cart.children, true).length > 0 || !!hitName(event);
  }
  function moveTo(view, duration = 820) {
    currentView = view;
    activeMove = {
      start: performance.now(),
      duration: reducedMotion.matches ? 0 : duration,
      fromPosition: camera.position.clone(),
      fromTarget: look.clone(),
      fromZoom: camera.zoom,
    };
  }
  function setStage(next, name = '') {
    stage = next;
    focusName = next === 'item' ? name : '';
    hoverName = '';
    Object.values(ribbons).forEach(element => element.classList.remove('is-visible'));
    moveTo(next === 'item' ? views[name] : next === 'bar' ? bar : home);
    const query = next === 'item' ? `${location.pathname}?focus=${name}` : next === 'bar' ? `${location.pathname}?focus=bar` : location.pathname;
    history.replaceState({}, '', query);
    window.dispatchEvent(new CustomEvent('cart-stage', { detail: { stage: next, name } }));
  }
  window.addEventListener('menu-close', () => setStage('bar'));
  window.addEventListener('tin-close', () => setStage('bar'));
  window.addEventListener('gacha-close', () => setStage('bar'));
  window.addEventListener('ranking-close', () => setStage('bar'));
  document.querySelector('.scene-nav').addEventListener('click', event => {
    const button = event.target.closest('[data-scene-open]');
    if (!button || stage === 'item') return;
    setStage('item', button.dataset.sceneOpen);
    if (button.dataset.sceneOpen === 'menu') window.dispatchEvent(new Event('menu-open'));
  });
  renderer.domElement.addEventListener('pointermove', event => {
    const name = stage === 'bar' ? hitName(event) : '';
    if (name !== hoverName) {
      if (hoverName) ribbons[hoverName].classList.remove('is-visible');
      hoverName = name;
      if (name) ribbons[name].classList.add('is-visible');
    }
    if (stage === 'home') {
      renderer.domElement.style.cursor = hitCart(event) ? 'pointer' : 'default';
    } else if (stage === 'bar') {
      renderer.domElement.style.cursor = name || !hitCart(event) ? 'pointer' : 'default';
    } else renderer.domElement.style.cursor = 'pointer';
  });
  renderer.domElement.addEventListener('pointerleave', () => {
    if (hoverName) ribbons[hoverName].classList.remove('is-visible');
    hoverName = '';
    renderer.domElement.style.cursor = 'default';
  });
  renderer.domElement.addEventListener('click', event => {
    if (stage === 'home') { if (hitCart(event)) setStage('bar'); return; }
    if (stage === 'item') { if (focusName !== 'menu' && focusName !== 'gacha' && focusName !== 'ranking') setStage('bar'); return; }
    const name = hitName(event);
    if (name) {
      setStage('item', name);
      if (name === 'menu') window.dispatchEvent(new Event('menu-open'));
    } else if (!hitCart(event)) setStage('home');
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && focusName !== 'menu' && focusName !== 'tin' && focusName !== 'gacha' && focusName !== 'ranking' && document.querySelector('#card-layer').hidden) setStage(stage === 'item' ? 'bar' : 'home');
  });
  const initial = new URLSearchParams(location.search).get('focus');
  if (views[initial] || initial === 'bar') {
    stage = views[initial] ? 'item' : 'bar';
    focusName = views[initial] ? initial : '';
    currentView = views[initial] || bar;
    camera.position.copy(currentView.position);
    look.copy(currentView.target);
    camera.zoom = currentView.zoom;
    camera.updateProjectionMatrix();
    camera.lookAt(look);
  } else if (!reducedMotion.matches) moveTo(bar, 2300);

  function resize() {
    const w = mount.clientWidth, h = mount.clientHeight;
    camera.left = -4.8 * w / h;
    camera.right = 4.8 * w / h;
    camera.top = 4.8;
    camera.bottom = -4.8;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', resize);
  resize();
  function positionOverlay(element, point, scale = 1, rotation = 0) {
    const projected = point.clone().project(camera);
    const visible = projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 1.4 && Math.abs(projected.y) < 1.4;
    element.style.visibility = visible ? '' : 'hidden';
    element.style.left = `${(projected.x + 1) * mount.clientWidth / 2}px`;
    element.style.top = `${(1 - projected.y) * mount.clientHeight / 2}px`;
    element.style.transform = `translate(-50%, -50%) rotateY(${rotation}deg) scale(${scale})`;
  }
  function animate() {
    requestAnimationFrame(animate);
    if (activeMove) {
      const elapsed = performance.now() - activeMove.start;
      const t = activeMove.duration ? Math.min(1, elapsed / activeMove.duration) : 1;
      const eased = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      camera.position.copy(activeMove.fromPosition).lerp(currentView.position, eased);
      look.copy(activeMove.fromTarget).lerp(currentView.target, eased);
      camera.zoom = activeMove.fromZoom + (currentView.zoom - activeMove.fromZoom) * eased;
      if (t === 1) activeMove = null;
    }
    camera.updateProjectionMatrix();
    camera.lookAt(look);
    camera.updateMatrixWorld();
    Object.entries(focusables).forEach(([name, group]) => {
      const active = stage === 'bar' && hoverName === name;
      const amount = active ? 1 : 0;
      if (reducedMotion.matches) {
        group.scale.setScalar(1);
        group.position.y = group.userData.restY;
        group.userData.glow.intensity = 0;
      } else {
        group.scale.lerp(new THREE.Vector3(1 + amount * .08, 1 + amount * .08, 1 + amount * .08), .17);
        group.position.y += (group.userData.restY + amount * .055 - group.position.y) * .17;
        group.userData.glow.intensity += (amount * 1.5 - group.userData.glow.intensity) * .17;
      }
      group.traverse(child => {
        if (child.isMesh && child.material.emissiveIntensity !== undefined) {
          child.material.emissiveIntensity = reducedMotion.matches ? 0 : child.material.emissiveIntensity + (amount * .35 - child.material.emissiveIntensity) * .17;
        }
      });
    });
    const lidTarget = stage === 'item' && focusName === 'tin' ? -2.55 : 0;
    tinLid.rotation.x += (lidTarget - tinLid.rotation.x) * (reducedMotion.matches ? 1 : .09);
    if (hoverName && stage === 'bar') positionOverlay(ribbons[hoverName], labelPoints[hoverName], Math.min(camera.zoom * .52, .82));
    renderer.render(scene, camera);
  }
  animate();
})();
