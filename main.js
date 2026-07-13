import { CONFIG } from "./config.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const esc = (str = "") =>
  String(str).replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])
  );
const ruble = (n) => n.toLocaleString("ru-RU") + " ₽";
const pad = (n) => String(n).padStart(2, "0");

/* контент */
const h = CONFIG.hero;
$$("[data-brand]").forEach((el) => (el.textContent = CONFIG.brand));
document.title = `${CONFIG.brand} — спешелти-кофе, обжарка под заказ`;
$("[data-hero-label]").textContent = h.label;
$("[data-hero-index]").textContent = `N°${h.index} · ${CONFIG.since}`;
$("[data-hero-lead]").textContent = h.lead;
$("[data-hero-accent]").textContent = h.accentWord;
$("[data-hero-tail]").textContent = h.tail;
$("[data-hero-manifesto]").textContent = h.manifesto;
$("[data-hero-cta]").textContent = h.cta;
$("[data-hero-img]").src = h.image;

const p = CONFIG.product;
$("[data-product-batch]").textContent = p.batch;
$("[data-product-name]").textContent = p.name;
$("[data-product-specs]").innerHTML = p.specs
  .map(([k, v]) => `<div class="spec__row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
  .join("");
$("[data-product-price]").textContent = ruble(p.price);
$("[data-product-old]").textContent = ruble(p.oldPrice);
$("[data-product-img]").src = p.image;

const tick = ["SINGLE ORIGIN", "ОБЖАРКА ПОД ЗАКАЗ", "ДОСТАВКА ПО РФ", p.name.toUpperCase(), p.batch, "БЕЗ ГОРЕЧИ"];
$("[data-ticker]").innerHTML = [...tick, ...tick]
  .map((w) => `<span>${esc(w)}<i>✳</i></span>`)
  .join("");

$("[data-benefits]").innerHTML = CONFIG.benefits
  .map(
    (b) => `<li class="why__item"><span class="why__n">${esc(b.n)}</span>
      <div><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></div></li>`
  )
  .join("");

$("[data-gallery]").innerHTML = CONFIG.gallery
  .map(
    (g) => `<figure><img src="${esc(g.src)}" alt="${esc(g.cap)}" loading="lazy" />
      <figcaption class="gallery__cap">${esc(g.cap)}</figcaption></figure>`
  )
  .join("");

$("[data-reviews]").innerHTML = CONFIG.reviews
  .map(
    (r) => `<article class="review"><div class="review__mark">“</div>
      <p class="review__text">${esc(r.text)}</p>
      <p class="review__by"><b>${esc(r.name)}</b> · ${esc(r.city)}</p></article>`
  )
  .join("");

$("[data-promo-label]").textContent = CONFIG.promo.label;
$("[data-promo-stock]").textContent = `ОСТАЛОСЬ ${CONFIG.promo.stockLeft} ПАЧЕК ПО АКЦИИ`;

const c = CONFIG.contacts;
$("[data-contacts]").innerHTML = `
  <li><a href="tel:${c.phone.replace(/\s/g, "")}">${esc(c.phone)}</a></li>
  <li><a href="https://t.me/${esc(c.telegram.replace(/^@/, ""))}" target="_blank" rel="noopener">${esc(c.telegram)}</a></li>
  <li><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
  <li>${esc(c.address.toUpperCase())}</li>`;

/* живые часы — Москва */
const clocks = $$("[data-clock]");
function tickClock() {
  const t = new Date().toLocaleTimeString("ru-RU", { hour12: false, timeZone: "Europe/Moscow" });
  clocks.forEach((el) => (el.textContent = `${t} [${CONFIG.city}]`));
}
tickClock();
setInterval(tickClock, 1000);

/* таймер акции */
const deadline = Date.now() + CONFIG.promo.endsInHours * 3600 * 1000;
const elH = $("[data-t-h]"), elM = $("[data-t-m]"), elS = $("[data-t-s]");
function remaining(now) {
  const total = Math.floor(Math.max(0, deadline - now) / 1000);
  return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 };
}
function tickTimer() {
  const t = remaining(Date.now());
  elH.textContent = pad(t.h);
  elM.textContent = pad(t.m);
  elS.textContent = pad(t.s);
}
tickTimer();
setInterval(tickTimer, 1000);

/* форма — валидация + подтверждение */
const form = $("[data-form]");
const statusEl = $("[data-status]");
const submitBtn = $(".form__submit", form);
const setStatus = (text, cls) => {
  statusEl.textContent = text;
  statusEl.className = `form__status ${cls}`;
};
const phoneOk = (v) => (v.match(/\d/g) || []).length >= 10;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  if (name.length < 2) return setStatus("→ ВВЕДИТЕ ИМЯ", "is-err");
  if (!phoneOk(phone)) return setStatus("→ ВВЕДИТЕ КОРРЕКТНЫЙ ТЕЛЕФОН", "is-err");

  submitBtn.disabled = true;
  const original = submitBtn.textContent;
  submitBtn.textContent = "ОФОРМЛЯЕМ…";
  setTimeout(() => {
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = original;
    setStatus(`✓ ${name.toUpperCase()}, ЗАКАЗ ПРИНЯТ. ПЕРЕЗВОНИМ НА ${phone}`, "is-ok");
  }, 700);
});

/* самопроверка таймера: ?selftest */
if (location.search.includes("selftest")) {
  console.assert(pad(3) === "03", "pad");
  const t = remaining(deadline - 3661 * 1000);
  console.assert(t.h === 1 && t.m === 1 && t.s === 1, "remaining", t);
  console.assert(remaining(deadline + 5000).h === 0, "clamp");
  console.log("selftest ok");
}

/* Parallax Beans */
const parallaxBeans = $$('.bean');
let frameId;
window.addEventListener('scroll', () => {
  if (frameId) cancelAnimationFrame(frameId);
  frameId = requestAnimationFrame(() => {
    const scrolled = window.scrollY;
    parallaxBeans.forEach(bean => {
      const speed = parseFloat(bean.dataset.speed) || 0.5;
      bean.style.setProperty('--y', `${scrolled * speed}px`);
    });
  });
}, { passive: true });

/* Magnetic Buttons */
const magneticBtns = $$('.btn');
magneticBtns.forEach(btn => {
  btn.style.transition = 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.3s, color 0.3s';
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
  });
});
