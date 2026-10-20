(function () {
  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  // Facebook, Messenger and Instagram open links in their own small browser.
  const inApp = /FBAN|FBAV|FB_IAB|FBIOS|Messenger|Instagram/i.test(ua);

  const $ = (s, el = document) => el.querySelector(s);
  const body = document.body;
  let emojis = [];
  try { emojis = JSON.parse(body.dataset.particles || "[]"); } catch (e) {}

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  // Falling critters in the background.
  const box = $(".particles");
  if (box && emojis.length) {
    const count = innerWidth < 600 ? 14 : 22;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "particle";
      p.textContent = emojis[i % emojis.length];
      p.style.left = Math.random() * 100 + "%";
      p.style.fontSize = 14 + Math.random() * 18 + "px";
      p.style.animationDuration = 14 + Math.random() * 16 + "s";
      p.style.animationDelay = -Math.random() * 30 + "s";
      p.style.setProperty("--sway", Math.random() * 120 - 60 + "px");
      box.appendChild(p);
    }
  }

  // Fade sections in as they scroll into view.
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("in"));
  }

  function burst(x, y) {
    if (!emojis.length) return;
    for (let i = 0; i < 14; i++) {
      const c = document.createElement("span");
      c.className = "confetti";
      c.textContent = emojis[i % emojis.length];
      c.style.left = x + "px";
      c.style.top = y + "px";
      const a = Math.random() * Math.PI * 2;
      const d = 60 + Math.random() * 90;
      c.style.setProperty("--dx", Math.cos(a) * d + "px");
      c.style.setProperty("--dy", Math.sin(a) * d - 40 + "px");
      c.style.setProperty("--rot", Math.random() * 360 + "deg");
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 1200);
    }
  }

  function toast(msg) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("show"), 2200);
  }

  // Screenshot strip: arrow buttons, hidden at either end.
  const strip = $(".shots");
  if (strip) {
    const prev = $(".arrow.prev"), next = $(".arrow.next");
    const update = () => {
      prev.hidden = strip.scrollLeft < 8;
      next.hidden = strip.scrollLeft + strip.clientWidth > strip.scrollWidth - 8;
    };
    const step = () => strip.clientWidth * 0.8;
    prev.addEventListener("click", () => strip.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => strip.scrollBy({ left: step(), behavior: "smooth" }));
    strip.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  }

  const slug = body.dataset.game;
  if (!slug || body.dataset.status !== "testing") return;

  // Google Play sign-in fails inside Messenger/Facebook, so offer Chrome.
  if (inApp) {
    const banner = $("#inapp");
    banner.classList.add("show");
    if (isIOS) banner.classList.add("ios");
    const url = location.origin + location.pathname;
    $("#chrome").href = isAndroid
      ? "intent://" + location.host + location.pathname + "#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=" + encodeURIComponent(url) + ";end"
      : url;
  }

  // Remember which steps the tester already did, per game.
  ["optin", "install"].forEach((id) => {
    const key = "cozy-" + slug + "-" + id;
    const step = $("#step-" + id);
    if (store(key)) step.classList.add("done");
    $("#" + id).addEventListener("click", (e) => {
      store(key, "1");
      step.classList.add("done");
      burst(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
    });
  });

  $("#share").addEventListener("click", async () => {
    const url = location.origin + location.pathname;
    const title = document.querySelector("h1").textContent;
    if (navigator.share) {
      try { await navigator.share({ title, text: "Help test " + title + "!", url }); } catch (e) {}
      return;
    }
    try { await navigator.clipboard.writeText(url); toast("Link copied!"); }
    catch (e) { toast(url); }
  });
})();
