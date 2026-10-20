(function () {
  const ua = navigator.userAgent || "";
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  // Facebook, Messenger and Instagram open links in their own small browser.
  const inApp = /FBAN|FBAV|FB_IAB|FBIOS|Messenger|Instagram/i.test(ua);

  const $ = (s, el = document) => el.querySelector(s);
  const games = window.GAMES || [];

  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  function particles(list, count) {
    const box = $(".particles");
    if (!box || !list.length) return;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      p.className = "particle";
      p.textContent = list[i % list.length];
      p.style.left = Math.random() * 100 + "%";
      p.style.fontSize = 14 + Math.random() * 18 + "px";
      p.style.animationDuration = 14 + Math.random() * 16 + "s";
      p.style.animationDelay = -Math.random() * 30 + "s";
      p.style.setProperty("--sway", (Math.random() * 120 - 60) + "px");
      box.appendChild(p);
    }
  }

  function burst(x, y, list) {
    for (let i = 0; i < 14; i++) {
      const c = document.createElement("span");
      c.className = "confetti";
      c.textContent = list[i % list.length];
      c.style.left = x + "px";
      c.style.top = y + "px";
      const a = Math.random() * Math.PI * 2;
      const d = 60 + Math.random() * 90;
      c.style.setProperty("--dx", Math.cos(a) * d + "px");
      c.style.setProperty("--dy", Math.sin(a) * d - 40 + "px");
      c.style.setProperty("--rot", (Math.random() * 360) + "deg");
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

  // ---------- home ----------
  const grid = $("#grid");
  if (grid) {
    games.forEach((g, i) => {
      const a = document.createElement("a");
      a.className = "game-card";
      a.href = g.slug + "/";
      a.style.setProperty("--c1", g.color);
      a.style.setProperty("--c2", g.color2);
      a.style.animationDelay = i * 0.08 + "s";
      a.innerHTML =
        '<div class="art"><img src="assets/icons/' + g.slug + '.png" alt="" loading="lazy" width="256" height="256"></div>' +
        "<h3>" + g.name + "</h3><p>" + g.tagline + '</p><span class="go">Test it →</span>';
      grid.appendChild(a);
    });
    particles(["🐝", "🌸", "🥐", "🫧", "❄️", "🧶", "🍃", "✨"], 22);
  }

  // ---------- game page ----------
  const slug = document.body.dataset.game;
  const g = games.find((x) => x.slug === slug);
  if (!g) return;

  const root = document.documentElement;
  root.style.setProperty("--c1", g.color);
  root.style.setProperty("--c2", g.color2);
  particles(g.particles, 18);

  $("#icon").src = "../assets/icons/" + g.slug + ".png";
  $("#name").textContent = g.name;
  $("#tag").textContent = g.tagline;

  const optIn = "https://play.google.com/apps/testing/" + g.pkg;
  const play = "https://play.google.com/store/apps/details?id=" + g.pkg;
  $("#optin").href = optIn;
  $("#install").href = play;

  if (inApp) {
    const box = $("#inapp");
    box.classList.add("show");
    if (isIOS) box.classList.add("ios");
    const here = location.host + location.pathname;
    $("#chrome").href = isAndroid
      ? "intent://" + here + "#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=" + encodeURIComponent(location.href) + ";end"
      : location.href;
  }

  // Remember which steps the tester already did, per game.
  ["optin", "install"].forEach((id) => {
    const key = "cozy-" + g.slug + "-" + id;
    const step = $("#step-" + id);
    if (store(key)) step.classList.add("done");
    $("#" + id).addEventListener("click", (e) => {
      store(key, "1");
      step.classList.add("done");
      burst(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2, g.particles);
    });
  });

  $("#share").addEventListener("click", async () => {
    const url = location.origin + location.pathname;
    if (navigator.share) {
      try { await navigator.share({ title: g.name, text: "Help test " + g.name + "!", url }); } catch (e) {}
      return;
    }
    try { await navigator.clipboard.writeText(url); toast("Link copied!"); }
    catch (e) { toast(url); }
  });
})();
