import { CONFIG } from "./config.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const esc = (str = "") =>
  String(str).replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])
  );

const ruble = (n) => n.toLocaleString("ru-RU") + " ₽";
const pad = (n) => String(n).padStart(2, "0");

/* ---- контент из конфига ---- */
const h = CONFIG.hero;
$$("[data-brand]").forEach((el) => (el.textContent = CONFIG.brand));
document.title = `${CONFIG.brand} — ${CONFIG.tagline}`;
$("[data-hero-kicker]").textContent = h.kicker;
$("[data-hero-lead]").textContent = h.lead + " ";
$("[data-hero-accent]").textContent = h.accentWord;
$("[data-hero-tail]").textContent = " " + h.tail;
$("[data-hero-sub]").textContent = h.subtitle;
$("[data-hero-cta]").textContent = h.cta;
$("[data-hero-cta-sub]").textContent = h.ctaSub;
$("[data-hero-img]").src = h.image;

const p = CONFIG.product;
$("[data-product-img]").src = p.image;
$("[data-product-name]").textContent = p.name;
$("[data-product-origin]").textContent = p.origin;
$("[data-product-notes]").innerHTML = p.notes.map((n) => `<li>${esc(n)}</li>`).join("");
$("[data-product-weight]").textContent = p.weight;
$("[data-product-price]").textContent = ruble(p.price);
$("[data-product-old]").textContent = ruble(p.oldPrice);

const tickerWords = [...p.notes, "Single origin", "Обжарка под заказ", "Доставка по РФ"];
$("[data-ticker]").innerHTML = [...tickerWords, ...tickerWords]
  .map((w) => `<span>${esc(w)}<i class="dot">✦</i></span>`)
  .join("");

$("[data-benefits]").innerHTML = CONFIG.benefits
  .map(
    (b) => `
    <article class="why__item" data-reveal>
      <span class="why__n">${esc(b.n)}</span>
      <div><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></div>
    </article>`
  )
  .join("");

$("[data-gallery]").innerHTML = CONFIG.gallery
  .map((src) => `<figure data-reveal><img src="${esc(src)}" alt="Кофе" loading="lazy" /></figure>`)
  .join("");

$("[data-reviews]").innerHTML = CONFIG.reviews
  .map(
    (r) => `
    <article class="review" data-reveal>
      <div class="review__stars">${"★".repeat(r.stars)}</div>
      <p class="review__text">«${esc(r.text)}»</p>
      <p class="review__by"><b>${esc(r.name)}</b> · ${esc(r.city)}</p>
    </article>`
  )
  .join("");

$("[data-promo-label]").textContent = CONFIG.promo.label;
$("[data-promo-stock]").textContent = `Осталось ${CONFIG.promo.stockLeft} пачек по акции`;

const c = CONFIG.contacts;
$("[data-contacts]").innerHTML = `
  <li><a href="tel:${c.phone.replace(/\s/g, "")}">${esc(c.phone)}</a></li>
  <li><a href="https://t.me/${esc(c.telegram.replace(/^@/, ""))}" target="_blank" rel="noopener">${esc(c.telegram)}</a></li>
  <li><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>
  <li>${esc(c.address)}</li>`;

/* ---- таймер акции ---- */
const deadline = Date.now() + CONFIG.promo.endsInHours * 3600 * 1000;
const elH = $("[data-t-h]"), elM = $("[data-t-m]"), elS = $("[data-t-s]");

function remaining(now) {
  const left = Math.max(0, deadline - now);
  const total = Math.floor(left / 1000);
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

/* ---- форма (демо: валидация + успех) ---- */
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

  if (name.length < 2) return setStatus("Введите имя.", "is-err");
  if (!phoneOk(phone)) return setStatus("Введите корректный номер телефона.", "is-err");

  submitBtn.disabled = true;
  const original = submitBtn.textContent;
  submitBtn.textContent = "Оформляем…";
  setTimeout(() => {
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = original;
    setStatus(`✅ ${name}, заказ принят! Перезвоним на ${phone} для подтверждения.`, "is-ok");
  }, 700);
});

/* ---- reveal: над сгибом — сразу, ниже — по мере прокрутки ---- */
const revealNow = (el) => el.classList.add("is-in");
if (reduceMotion || !("IntersectionObserver" in window)) {
  $$("[data-reveal]").forEach(revealNow);
} else {
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          obs.unobserve(en.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );
  $$("[data-reveal]").forEach((el) => {
    if (el.getBoundingClientRect().top < innerHeight * 0.92) revealNow(el);
    else io.observe(el);
  });
}

/* ---- шапка при скролле ---- */
const nav = $("[data-nav]");
const onScroll = () => nav.classList.toggle("is-solid", window.scrollY > 40);
onScroll();
addEventListener("scroll", onScroll, { passive: true });

/* ---- самопроверка логики таймера: open ?selftest ---- */
if (location.search.includes("selftest")) {
  console.assert(pad(3) === "03" && pad(42) === "42", "pad broken");
  const t = remaining(deadline - 3661 * 1000);
  console.assert(t.h === 1 && t.m === 1 && t.s === 1, "remaining broken", t);
  console.assert(remaining(deadline + 5000).h === 0, "clamp broken");
  console.log("selftest ok");
}
