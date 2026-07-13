/* ============================================================================
   HessiKz portfolio - shared frontend engine (GSAP-powered, accessible).
   Author: Hesam Kazemi (@HessiKz)
   ========================================================================== */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const E = {
    el(sel, root = document) { return root.querySelector(sel); },
    els(sel, root = document) { return Array.from(root.querySelectorAll(sel)); },
    h(tag, attrs = {}, ...kids) {
      const n = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs || {})) {
        if (k === "class") n.className = v;
        else if (k === "html") n.innerHTML = v;
        else if (k === "aria" || k === "aria-label") n.setAttribute("aria-label", v);
        else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
        else if (v !== false && v != null) n.setAttribute(k, v);
      }
      for (const kid of kids.flat()) {
        if (kid == null) continue;
        n.appendChild(typeof kid === "string" ? document.createTextNode(kid) : kid);
      }
      return n;
    },
    clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; },
    on(id, fn) { const n = document.getElementById(id); if (n) n.addEventListener("click", fn); },
    toast(msg) {
      let t = document.querySelector(".toast");
      if (!t) { t = E.h("div", { class: "toast", role: "status", "aria-live": "polite" }); document.body.appendChild(t); }
      t.textContent = msg; t.classList.add("show");
      clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 2200);
    },
    rand(min, max) { return Math.random() * (max - min) + min; },
    fmt(n) { return Number(n).toLocaleString("en-US"); },
    img(seed, w, h, extra) {
      const im = E.h("img", Object.assign({
        src: "https://picsum.photos/seed/" + seed + "/" + w + "/" + h,
        alt: "", loading: "lazy", width: w, height: h
      }, extra || {}));
      return im;
    }
  };

  /* ---- Line chart (canvas) ---- */
  E.lineChart = function (canvas, series, opts = {}) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 600, hgt = canvas.clientHeight || 248;
    canvas.width = w * dpr; canvas.height = hgt * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const pad = { l: 38, r: 14, t: 14, b: 24 };
    const maxV = Math.max(...series.flatMap(s => s.data), 1) * 1.12;
    const npts = series[0].data.length;
    const X = i => pad.l + (i / (npts - 1)) * (w - pad.l - pad.r);
    const Y = v => hgt - pad.b - (v / maxV) * (hgt - pad.t - pad.b);
    ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const gy = pad.t + (g / 4) * (hgt - pad.t - pad.b);
      ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(w - pad.r, gy); ctx.stroke();
    }
    ctx.fillStyle = "rgba(154,163,178,0.8)"; ctx.font = "11px " + "JetBrains Mono, monospace";
    ctx.fillText(String(Math.round(maxV)), 4, pad.t + 8);
    series.forEach(s => {
      const grad = ctx.createLinearGradient(0, pad.t, 0, hgt - pad.b);
      grad.addColorStop(0, s.color + "55"); grad.addColorStop(1, s.color + "00");
      ctx.beginPath(); ctx.moveTo(X(0), Y(s.data[0]));
      s.data.forEach((v, i) => ctx.lineTo(X(i), Y(v)));
      ctx.lineTo(X(npts - 1), hgt - pad.b); ctx.lineTo(X(0), hgt - pad.b); ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();
      ctx.beginPath(); ctx.moveTo(X(0), Y(s.data[0]));
      s.data.forEach((v, i) => ctx.lineTo(X(i), Y(v)));
      ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(X(npts - 1), Y(s.data[npts - 1]), 3, 0, 7); ctx.fillStyle = s.color; ctx.fill();
    });
    if (opts.legend) {
      let lx = pad.l;
      series.forEach(s => {
        ctx.fillStyle = s.color; ctx.fillRect(lx, 2, 10, 10);
        ctx.fillStyle = "#9aa3b2"; ctx.fillText(s.name, lx + 14, 11); lx += 20 + ctx.measureText(s.name).width + 14;
      });
    }
  };

  /* ---- Bars ---- */
  E.bars = function (container, items, maxVal) {
    E.clear(container);
    const max = maxVal || Math.max(...items.map(i => i.value), 1);
    items.forEach((it, i) => {
      const fill = E.h("div", { class: "bar-fill" });
      const row = E.h("div", { class: "bar-row" },
        E.h("div", { class: "name" }, it.label),
        E.h("div", { class: "bar-track" }, fill),
        E.h("div", { class: "name", style: "width:auto;text-align:right;color:var(--text);font-variant-numeric:tabular-nums" }, String(it.value))
      );
      container.appendChild(row);
      requestAnimationFrame(() => { fill.style.width = (it.value / max * 100) + "%"; });
    });
  };

  /* ---- Terminal typing ---- */
  E.terminal = function (elem, lines) {
    let i = 0;
    function step() {
      if (i >= lines.length) return;
      const line = lines[i];
      const cur = E.h("div");
      if (typeof line === "object") { cur.className = line.cls || ""; cur.innerHTML = line.html || line.text || ""; elem.appendChild(cur); i++; setTimeout(step, 60); return; }
      elem.appendChild(cur);
      let ci = 0;
      function type() {
        if (ci <= line.length) { cur.textContent = line.slice(0, ci); ci++; setTimeout(type, reduce ? 0 : 12); }
        else { i++; setTimeout(step, 110); }
      }
      type();
    }
    if (reduce) { lines.forEach(l => { const d = E.h("div"); if (typeof l === "object") { d.className = l.cls || ""; d.innerHTML = l.html || l.text || ""; } else d.textContent = l; elem.appendChild(d); }); return; }
    step();
  };

  /* ---- Count-up ---- */
  E.countUp = function (elem, target, opts = {}) {
    if (reduce) { elem.textContent = (opts.dec ? target.toFixed(opts.dec) : Math.round(target).toLocaleString("en-US")) + (opts.suffix || ""); return; }
    const dur = opts.dur || 1100, start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3), val = target * e;
      elem.textContent = (opts.dec ? val.toFixed(opts.dec) : Math.round(val).toLocaleString("en-US")) + (opts.suffix || "");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  /* ---- SVG node graph ---- */
  E.nodeGraph = function (svg, nodes, edges) {
    const ns = "http://www.w3.org/2000/svg";
    const W = svg.clientWidth || 600, H = svg.clientHeight || 360;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const cellW = W / cols, cellH = H / Math.ceil(nodes.length / cols);
    const pos = {};
    nodes.forEach((n, i) => { pos[n.id] = { x: (i % cols) * cellW + cellW / 2, y: Math.floor(i / cols) * cellH + cellH / 2 }; });
    edges.forEach(e => {
      const a = pos[e.from], b = pos[e.to];
      const p = document.createElementNS(ns, "path");
      p.setAttribute("class", "edge");
      p.setAttribute("d", `M${a.x} ${a.y} C${a.x} ${(a.y + b.y) / 2},${b.x} ${(a.y + b.y) / 2},${b.x} ${b.y}`);
      svg.appendChild(p);
      const c = document.createElementNS(ns, "circle"); c.setAttribute("r", 3); c.setAttribute("fill", "var(--accent)"); svg.appendChild(c);
      if (!reduce) { let t = 0; setInterval(() => { t = (t + 0.012) % 1; c.setAttribute("cx", a.x + (b.x - a.x) * t); c.setAttribute("cy", a.y + (b.y - a.y) * t); }, 30); }
      else { c.setAttribute("cx", b.x); c.setAttribute("cy", b.y); }
    });
    nodes.forEach(n => {
      const g = document.createElementNS(ns, "g"); g.setAttribute("class", "node" + (n.accent ? " accent" : ""));
      const rw = Math.max(120, n.label.length * 7 + 24);
      const rect = document.createElementNS(ns, "rect");
      rect.setAttribute("x", pos[n.id].x - rw / 2); rect.setAttribute("y", pos[n.id].y - 22);
      rect.setAttribute("width", rw); rect.setAttribute("height", 44); rect.setAttribute("rx", 12);
      g.appendChild(rect);
      const t1 = document.createElementNS(ns, "text"); t1.setAttribute("x", pos[n.id].x); t1.setAttribute("y", pos[n.id].y - 2); t1.setAttribute("text-anchor", "middle"); t1.textContent = n.label;
      g.appendChild(t1);
      if (n.sub) { const t2 = document.createElementNS(ns, "text"); t2.setAttribute("x", pos[n.id].x); t2.setAttribute("y", pos[n.id].y + 14); t2.setAttribute("text-anchor", "middle"); t2.setAttribute("fill", "var(--faint)"); t2.setAttribute("font-size", 11); t2.textContent = n.sub; g.appendChild(t2); }
      svg.appendChild(g);
    });
  };

  /* ---- Code highlight ---- */
  E.highlight = function (code) {
    return code
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/(\/\/[^\n]*)/g, '<span class="com">$1</span>')
      .replace(/(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;|"[^"\n]*"|'[^'\n]*')/g, '<span class="str">$1</span>')
      .replace(/\b(class|def|func|import|from|const|let|var|return|if|else|for|while|export|default|async|await|package|type|struct|interface|extends|implements|new|public|private|void|int|string|bool|go|require|fn|use)\b/g, '<span class="kw">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');
  };

  /* ---- Reveal on scroll + GSAP entrance ---- */
  E.reveal = function () {
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    E.els(".reveal").forEach(n => io.observe(n));

    if (reduce || !window.gsap) { E.els(".reveal").forEach(n => n.classList.add("show")); return; }
    gsap.registerPlugin(ScrollTrigger);
    E.els(".reveal").forEach((n, i) => {
      gsap.from(n, {
        opacity: 0, y: 26, duration: 0.8, delay: (i % 4) * 0.06,
        ease: "power3.out", scrollTrigger: { trigger: n, start: "top 88%", once: true }
      });
    });
    // staggered group children
    E.els("[data-stagger]").forEach(group => {
      gsap.from(group.children, {
        opacity: 0, y: 24, duration: 0.6, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: group, start: "top 85%", once: true }
      });
    });
  };

  window.E = E;
})();
