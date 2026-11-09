(() => {
  "use strict";

  const PRODUCTS = [
    { id: 1,  name: "Consola Nexus X",        cat: "Consolas",     price: 2299000, old: 2499000, icon: "🎮", color: "#dfe3ff", desc: "4K a 120 fps, SSD de 1 TB y control inalámbrico.", tag: "Nuevo" },
    { id: 2,  name: "Consola portátil Flip",  cat: "Consolas",     price: 1649000, icon: "🕹️", color: "#ffe9c9", desc: "Pantalla OLED de 7 pulgadas y 9 horas de batería." },
    { id: 3,  name: "Mini retro 500 juegos",  cat: "Consolas",     price: 389000,  icon: "👾", color: "#e1f6e8", desc: "Clásicos de 8 y 16 bits listos para jugar en tu TV." },
    { id: 4,  name: "Aventura Eterna",        cat: "Videojuegos",  price: 249000,  icon: "⚔️", color: "#ffdede", desc: "Mundo abierto de rol con más de 80 horas de historia.", tag: "Más vendido" },
    { id: 5,  name: "Turbo Circuit GP",       cat: "Videojuegos",  price: 199000,  old: 239000, icon: "🏎️", color: "#e3efff", desc: "Carreras arcade con multijugador en línea." },
    { id: 6,  name: "Pixel Farm Party",       cat: "Videojuegos",  price: 129000,  icon: "🌱", color: "#eaf7d4", desc: "Cultiva, decora y juega con hasta 4 amigos." },
    { id: 7,  name: "Audífonos Pulse 7",      cat: "Electrónica",  price: 459000,  old: 529000, icon: "🎧", color: "#efe1ff", desc: "Cancelación de ruido y micrófono para chat.", tag: "-13%" },
    { id: 8,  name: "Teclado mecánico K65",   cat: "Accesorios",   price: 319000,  icon: "⌨️", color: "#ffe1f0", desc: "Switches rojos, retroiluminado y formato 65%." },
    { id: 9,  name: "Mouse Gamer Orbit",      cat: "Accesorios",   price: 159000,  icon: "🖱️", color: "#dff5f5", desc: "26.000 DPI, ligero y con 70 horas de batería." },
    { id: 10, name: "Monitor 27\" 165 Hz",    cat: "Electrónica",  price: 1199000, icon: "🖥️", color: "#e6e9f5", desc: "Panel QHD de 1 ms con tecnología Adaptive Sync." },
    { id: 11, name: "Smartwatch Fit Pro",     cat: "Electrónica",  price: 689000,  icon: "⌚", color: "#fff1c9", desc: "GPS, oxígeno en sangre y 7 días de batería." },
    { id: 12, name: "Control Pro inalámbrico",cat: "Accesorios",   price: 289000,  icon: "🎛️", color: "#ffe6d6", desc: "Gatillos ajustables y vibración háptica." }
  ];

  const FREE_SHIPPING_FROM = 300000;
  const SHIPPING_COST = 18000;
  const CART_KEY = "voltio_cart";

  const $ = (id) => document.getElementById(id);
  const money = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

  const state = { cat: "Todo", query: "", sort: "rel", cart: loadCart() };

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; }
  }
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); } catch {}
  }

  /* ---------- Catálogo ---------- */
  function renderChips() {
    const cats = ["Todo", ...new Set(PRODUCTS.map((p) => p.cat))];
    $("chips").innerHTML = cats.map((c) =>
      `<button class="chip" role="tab" data-cat="${c}" aria-selected="${c === state.cat}">${c}</button>`).join("");
  }

  function visibleProducts() {
    const q = state.query.trim().toLowerCase();
    let list = PRODUCTS.filter((p) =>
      (state.cat === "Todo" || p.cat === state.cat) &&
      (!q || (p.name + " " + p.cat + " " + p.desc).toLowerCase().includes(q)));
    if (state.sort === "asc") list.sort((a, b) => a.price - b.price);
    if (state.sort === "desc") list.sort((a, b) => b.price - a.price);
    if (state.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "es"));
    return list;
  }

  function renderGrid() {
    const list = visibleProducts();
    $("grid").innerHTML = list.map((p) => `
      <article class="card">
        <div class="art" style="background:${p.color}">
          ${p.tag ? `<span class="tag">${p.tag}</span>` : ""}
          <span aria-hidden="true">${p.icon}</span>
        </div>
        <div class="body">
          <span class="cat">${p.cat}</span>
          <h3 class="name">${p.name}</h3>
          <p class="desc">${p.desc}</p>
          <div class="price-row">
            <span class="price">${money(p.price)}</span>
            ${p.old ? `<span class="old">${money(p.old)}</span>` : ""}
          </div>
          <button class="btn" data-add="${p.id}">Agregar al carrito</button>
        </div>
      </article>`).join("");
    $("empty").hidden = list.length > 0;
    $("resultInfo").textContent = `${list.length} ${list.length === 1 ? "producto" : "productos"}`;
  }

  /* ---------- Carrito ---------- */
  const find = (id) => PRODUCTS.find((p) => p.id === Number(id));
  const count = () => Object.values(state.cart).reduce((a, b) => a + b, 0);

  function totals() {
    const sub = Object.entries(state.cart).reduce((s, [id, q]) => s + find(id).price * q, 0);
    const ship = sub === 0 || sub >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
    return { sub, ship, total: sub + ship };
  }

  function renderCart() {
    const ids = Object.keys(state.cart);
    $("cartItems").innerHTML = ids.length ? ids.map((id) => {
      const p = find(id), q = state.cart[id];
      return `
      <div class="item">
        <div class="thumb" style="background:${p.color}" aria-hidden="true">${p.icon}</div>
        <div>
          <div class="t">${p.name}</div>
          <div class="p">${money(p.price)}</div>
          <div class="qty">
            <button data-dec="${id}" aria-label="Quitar una unidad">−</button>
            <span>${q}</span>
            <button data-inc="${id}" aria-label="Agregar una unidad">+</button>
          </div>
        </div>
        <div style="text-align:right">
          <strong>${money(p.price * q)}</strong><br>
          <button class="remove" data-del="${id}">Quitar</button>
        </div>
      </div>`;
    }).join("") : `<p class="cart-empty">Tu carrito está vacío.<br>Agrega algo del catálogo para empezar.</p>`;

    const t = totals();
    $("subtotal").textContent = money(t.sub);
    $("shipping").textContent = t.sub === 0 ? money(0) : t.ship ? money(t.ship) : "Gratis";
    $("total").textContent = money(t.total);
    $("checkout").disabled = $("clearCart").disabled = !ids.length;
    $("cartCount").textContent = count();
  }

  function change(id, delta) {
    const next = (state.cart[id] || 0) + delta;
    if (next <= 0) delete state.cart[id]; else state.cart[id] = Math.min(next, 10);
    saveCart(); renderCart();
  }

  function toast(msg) {
    const t = $("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function toggleCart(open) {
    $("drawer").classList.toggle("open", open);
    $("drawer").setAttribute("aria-hidden", String(!open));
    $("overlay").hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
    if (open) $("closeCart").focus(); else $("openCart").focus();
  }

  /* ---------- Eventos ---------- */
  $("chips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]"); if (!b) return;
    state.cat = b.dataset.cat; renderChips(); renderGrid();
  });
  $("search").addEventListener("input", (e) => { state.query = e.target.value; renderGrid(); });
  $("sort").addEventListener("change", (e) => { state.sort = e.target.value; renderGrid(); });
  $("resetFilters").addEventListener("click", () => {
    state.cat = "Todo"; state.query = ""; $("search").value = ""; renderChips(); renderGrid();
  });

  $("grid").addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]"); if (!b) return;
    change(b.dataset.add, 1);
    toast(`${find(b.dataset.add).name} se agregó al carrito`);
    $("cartCount").classList.remove("bump"); void $("cartCount").offsetWidth; $("cartCount").classList.add("bump");
  });

  $("cartItems").addEventListener("click", (e) => {
    const t = e.target;
    if (t.dataset.inc) change(t.dataset.inc, 1);
    if (t.dataset.dec) change(t.dataset.dec, -1);
    if (t.dataset.del) change(t.dataset.del, -(state.cart[t.dataset.del] || 0));
  });

  $("openCart").addEventListener("click", () => toggleCart(true));
  $("closeCart").addEventListener("click", () => toggleCart(false));
  $("overlay").addEventListener("click", () => toggleCart(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleCart(false); });

  $("clearCart").addEventListener("click", () => { state.cart = {}; saveCart(); renderCart(); });
  $("checkout").addEventListener("click", () => {
    const t = totals();
    state.cart = {}; saveCart(); renderCart(); toggleCart(false);
    toast(`Pedido confirmado por ${money(t.total)}. Gracias por tu compra.`);
  });

  renderChips(); renderGrid(); renderCart();
})();
