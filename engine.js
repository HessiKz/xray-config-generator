/* Shared frontend engine for HessiKz portfolio micro-sites.
   Provides DOM helpers, charting, terminal typing, SVG graphs.
   Author: Hesam Kazemi (@HessiKz) */
(function () {
  const E = {
    el(sel, root = document) { return root.querySelector(sel); },
    els(sel, root = document) { return Array.from(root.querySelectorAll(sel)); },
    h(tag, attrs = {}, ...kids) {
      const n = document.createElement(tag);
      for (const [k, v] of Object.entries(attrs || {})) {
        if (k === "class") n.className = v;
        else if (k === "html") n.innerHTML = v;
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
      if (!t) { t = E.h("div", { class: "toast" }); document.body.appendChild(t); }
      t.textContent = msg; t.classList.add("show");
      clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 2200);
    },
    rand(min, max) { return Math.random() * (max - min) + min; },
    fmt(n) { return n.toLocaleString("en-US"); },
    ensureSVG() {
      const ns = "http://www.w3.org/2000/svg";
      if (!document.querySelector('svg [data-vb]')) {}
      return ns;
    }
  };

  /* ---- Line chart via canvas ---- */
  E.lineChart = function (canvas, series, opts = {}) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth, hgt = canvas.clientHeight || 240;
    canvas.width = w * dpr; canvas.height = hgt * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const pad = { l: 36, r: 12, t: 12, b: 22 };
    const maxV = Math.max(...series.flatMap(s => s.data)) * 1.1 || 1;
    const npts = series[0].data.length;
    const x = i => pad.l + (i / (npts - 1)) * (w - pad.l - pad.r);
    const y = v => hgt - pad.b - (v / maxV) * (hgt - pad.t - pad.b);
    // grid
    ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g++) {
      const gy = pad.t + (g / 4) * (hgt - pad.t - pad.b);
      ctx.beginPath(); ctx.moveTo(pad.l, gy); ctx.lineTo(w - pad.r, gy); ctx.stroke();
    }
    // axes labels
    ctx.fillStyle = "rgba(154,163,178,0.8)"; ctx.font = "11px ui-monospace, monospace";
    ctx.fillText(String(Math.round(maxV)), 4, pad.t + 8);
    ctx.fillText("0", 4, hgt - pad.b);
    series.forEach(s => {
      const grad = ctx.createLinearGradient(0, pad.t, 0, hgt - pad.b);
      grad.addColorStop(0, s.color + "55"); grad.addColorStop(1, s.color + "00");
      // area
      ctx.beginPath(); ctx.moveTo(x(0), y(s.data[0]));
      s.data.forEach((v, i) => ctx.lineTo(x(i), y(v)));
      ctx.lineTo(x(npts - 1), hgt - pad.b); ctx.lineTo(x(0), hgt - pad.b); ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();
      // line
      ctx.beginPath(); ctx.moveTo(x(0), y(s.data[0]));
      s.data.forEach((v, i) => ctx.lineTo(x(i), y(v)));
      ctx.strokeStyle = s.color; ctx.lineWidth = 2; ctx.stroke();
      // head dot
      ctx.beginPath(); ctx.arc(x(npts - 1), y(s.data[npts - 1]), 3, 0, 7); ctx.fillStyle = s.color; ctx.fill();
    });
    if (opts.legend) {
      let lx = pad.l;
      series.forEach(s => {
        ctx.fillStyle = s.color; ctx.fillRect(lx, 2, 10, 10);
        ctx.fillStyle = "#9aa3b2"; ctx.fillText(s.name, lx + 14, 11); lx += 20 + ctx.measureText(s.name).width + 14;
      });
    }
  };

  /* ---- Horizontal bar chart ---- */
  E.bars = function (container, items, maxVal) {
    E.clear(container);
    const max = maxVal || Math.max(...items.map(i => i.value));
    items.forEach((it, i) => {
      const fill = E.h("div", { class: "bar-fill" });
      const row = E.h("div", { class: "bar-row" },
        E.h("div", { class: "name" }, it.label),
        E.h("div", { class: "bar-track" }, fill),
        E.h("div", { class: "name", style: "width:auto;text-align:right;color:var(--text)" }, String(it.value))
      );
      container.appendChild(row);
      setTimeout(() => { fill.style.width = (it.value / max * 100) + "%"; }, 60 + i * 60);
    });
  };

  /* ---- Terminal typing effect ---- */
  E.terminal = function (elem, lines, opts = {}) {
    let i = 0, buf = "";
    const speed = opts.speed || 14;
    function step() {
      if (i >= lines.length) return;
      const line = lines[i];
      if (typeof line === "object") {
        const span = E.h("div");
        if (line.cls) span.className = line.cls;
        span.innerHTML = line.html || line.text || "";
        elem.appendChild(span);
        i++; requestAnimationFrame(step);
        return;
      }
      const rest = line.slice(buf.length - (elem.childNodes.length ? 0 : 0));
      // type char by char
      let ci = 0;
      const cur = E.h("div"); elem.appendChild(cur);
      function typeChar() {
        if (ci <= line.length) {
          cur.textContent = line.slice(0, ci);
          ci++;
          setTimeout(typeChar, speed);
        } else { i++; setTimeout(step, opts.lineDelay || 120); }
      }
      typeChar();
    }
    step();
  };

  /* ---- Animated count-up stats ---- */
  E.countUp = function (elem, target, opts = {}) {
    const dur = opts.dur || 1100; const dec = opts.dec || 0;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      const val = target * e;
      elem.textContent = (dec ? val.toFixed(dec) : Math.round(val).toLocaleString("en-US")) + (opts.suffix || "");
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
    nodes.forEach((n, i) => {
      const c = i % cols, r = Math.floor(i / cols);
      pos[n.id] = { x: c * cellW + cellW / 2, y: r * cellH + cellH / 2 };
    });
    edges.forEach(e => {
      const a = pos[e.from], b = pos[e.to];
      const p = E.h("path", { class: "edge", d: `M${a.x} ${a.y} C${a.x} ${(a.y + b.y) / 2},${b.x} ${(a.y + b.y) / 2},${b.x} ${b.y}` });
      svg.appendChild(p);
      const circ = E.h("circle", { r: 3, fill: "var(--accent-2)" });
      svg.appendChild(circ);
      animateDash(circ, a, b);
    });
    nodes.forEach(n => {
      const g = E.h("g", { class: "node" + (n.accent ? " accent" : "") });
      const rw = Math.max(120, (n.label.length * 7) + 24);
      g.appendChild(E.h("rect", { x: pos[n.id].x - rw / 2, y: pos[n.id].y - 22, width: rw, height: 44, rx: 12, fill: "var(--surface-2)", stroke: n.accent ? "var(--accent)" : "var(--border-strong)" }));
      g.appendChild(E.h("text", { x: pos[n.id].x, y: pos[n.id].y - 2, "text-anchor": "middle", fill: "var(--text)", "font-size": 13 }, n.label));
      if (n.sub) g.appendChild(E.h("text", { x: pos[n.id].x, y: pos[n.id].y + 14, "text-anchor": "middle", fill: "var(--faint)", "font-size": 11 }, n.sub));
      svg.appendChild(g);
    });
    function animateDash(circ, a, b) {
      let t = 0;
      setInterval(() => {
        t = (t + 0.012) % 1;
        circ.setAttribute("cx", a.x + (b.x - a.x) * t);
        circ.setAttribute("cy", a.y + (b.y - a.y) * t);
      }, 30);
    }
  };

  /* ---- Typewriter for hero ---- */
  E.typewriter = function (elem, phrases) {
    let pi = 0, ci = 0, del = false;
    function tick() {
      const word = phrases[pi];
      elem.textContent = word.slice(0, ci);
      if (!del && ci < word.length) { ci++; setTimeout(tick, 70); }
      else if (!del && ci === word.length) { del = true; setTimeout(tick, 1400); }
      else if (del && ci > 0) { ci--; setTimeout(tick, 35); }
      else { del = false; pi = (pi + 1) % phrases.length; setTimeout(tick, 200); }
    }
    tick();
  };

  /* ---- Reveal on scroll ---- */
  E.reveal = function () {
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    E.els(".fade-in").forEach(n => io.observe(n));
  };

  /* ---- Markdown-ish code render (lightweight) ---- */
  E.highlight = function (code) {
    return code
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/(\/\/[^\n]*)/g, '<span class="com">$1</span>')
      .replace(/(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;|"[^"\n]*"|'[^'\n]*')/g, '<span class="str">$1</span>')
      .replace(/\b(class|def|func|import|from|const|let|var|return|if|else|for|while|export|default|async|await|package|func|type|struct|interface|extends|implements|new|public|private|void|int|string|bool|go|require)\b/g, '<span class="kw">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');
  };

  window.E = E;
})();
