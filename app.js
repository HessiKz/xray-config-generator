/* ============================================================================
   HessiKz portfolio - interactive views for all 25 projects.
   Each view renders into the #view container and showcases the project's stack.
   Author: Hesam Kazemi (@HessiKz)
   ========================================================================== */

window.VIEW = function (root, meta, A) {
  const map = {
    agent_playground: view_agent_playground,
    rag_kb: view_rag_kb,
    workflow_builder: view_workflow_builder,
    gateway: view_gateway,
    trace_viewer: view_trace_viewer,
    router: view_router,
    fastapi_explore: view_fastapi_explore,
    nestjs_explore: view_nestjs_explore,
    rate_limiter: view_rate_limiter,
    gateway_metrics: view_gateway_metrics,
    celery_monitor: view_celery_monitor,
    ws_chat: view_ws_chat,
    nextjs_ssr: view_nextjs_ssr,
    design_system: view_design_system,
    nuxt_dashboard: view_nuxt_dashboard,
    portfolio_theme: view_portfolio_theme,
    data_table: view_data_table,
    compose_starter: view_compose_starter,
    worker_template: view_worker_template,
    actions_lib: view_actions_lib,
    nginx_kit: view_nginx_kit,
    vps_playbook: view_vps_playbook,
    xray_gen: view_xray_gen,
    jwt_inspector: view_jwt_inspector,
    key_vault: view_key_vault
  };
  (map[meta.view] || view_fallback)(root, meta, A);
};

function panel(title, body, headExtra) {
  return E.h("div", { class: "panel" },
    E.h("div", { class: "panel-head" }, E.h("h3", {}, title), headExtra || E.h("span", {})), body);
}
function statRow(items) {
  const wrap = E.h("div", { class: "stats" });
  items.forEach(function (it) {
    const num = E.h("div", { class: "num" }, "0");
    wrap.appendChild(E.h("div", { class: "stat" }, num, E.h("div", { class: "lbl" }, it)));
    setTimeout(function () { E.countUp(num, it.val, { suffix: it.suffix || "" }); }, 200);
  });
  return wrap;
}
function codeBlock(code) { return E.h("pre", { class: "code", html: E.highlight(code) }); }

/* 1. AI Agent Playground */
function view_agent_playground(root) {
  const agents = [
    { id: "router", label: "Router Agent", sub: "intent", accent: true },
    { id: "retriever", label: "Retriever", sub: "RAG" },
    { id: "planner", label: "Planner", sub: "plan" },
    { id: "tool", label: "Tool Agent", sub: "exec" },
    { id: "writer", label: "Writer", sub: "gen" },
    { id: "critic", label: "Critic", sub: "eval" }
  ];
  const edges = [
    { from: "router", to: "retriever" }, { from: "router", to: "planner" },
    { from: "planner", to: "tool" }, { from: "retriever", to: "writer" },
    { from: "tool", to: "writer" }, { from: "writer", to: "critic" }, { from: "critic", to: "writer" }
  ];
  const svg = E.h("svg", { class: "graph" });
  const trace = E.h("div", { class: "terminal" }, E.h("div", { class: "bar" },
    E.h("i", { class: "r" }), E.h("i", { class: "y" }), E.h("i", { class: "g" })));
  const traceBody = E.h("div", { class: "body" });
  trace.appendChild(traceBody);
  const barBox = E.h("div", {});
  root.appendChild(E.h("div", { class: "grid cols-2" },
    E.h("div", {}, panel("Multi-Agent Topology", svg)),
    E.h("div", {}, panel("Run Trace", trace, E.h("span", { class: "badge green" }, "● live")))));
  root.appendChild(E.h("div", { class: "mt-2" }, panel("Per-Agent Latency (ms)", barBox)));
  E.nodeGraph(svg, agents, edges);
  const lat = { "Router Agent": 42, "Retriever": 118, "Planner": 76, "Tool Agent": 203, "Writer": 540, "Critic": 88 };
  E.bars(barBox, Object.keys(lat).map(function (k) { return { label: k, value: lat[k] }; }));
  const lines = [
    { cls: "dim", text: "$ run agent 'Summarize Q3 revenue and cite sources'" },
    { cls: "ok", text: "✓ Router Agent classified intent: research" },
    { cls: "dim", text: "  ↳ dispatched to Retriever + Planner" },
    { cls: "ok", text: "✓ Retriever returned 6 chunks (0.12s, cosine>0.81)" },
    { cls: "ok", text: "✓ Planner built 3-step plan" },
    { cls: "ok", text: "✓ Tool Agent executed calculator(x3)" },
    { cls: "ok", text: "✓ Writer drafted answer (518 tokens)" },
    { cls: "amber", text: "⟳ Critic: confidence 0.91 - approve" },
    { cls: "prompt", text: "✅ Done in 1.07s · 4 agents · 0 errors" }
  ];
  E.terminal(traceBody, lines);
}

/* 2. RAG Knowledge Base */
function view_rag_kb(root) {
  const q = E.h("input", { value: "How does rate limiting work?", placeholder: "Ask the knowledge base..." });
  const btn = E.h("button", { class: "btn primary" }, "Query");
  const chunks = E.h("div", { class: "grid cols-3" });
  const canvas = E.h("canvas", { class: "chart" });
  const citation = E.h("div", {});
  root.appendChild(E.h("div", { class: "panel" },
    E.h("div", { class: "panel-head" }, E.h("h3", {}, "Ask"), E.h("span", { class: "badge blue" }, "pgvector")),
    E.h("div", { class: "row" }, q, btn)));
  root.appendChild(E.h("div", { class: "grid cols-2 mt-2" },
    E.h("div", {}, panel("Retrieved Chunks", chunks)),
    E.h("div", {}, panel("Embedding Similarity (cosine)", canvas))));
  root.appendChild(E.h("div", { class: "mt-2" }, panel("Generated Answer + Citations", citation)));
  function run() {
    const sim = [0.92, 0.87, 0.81, 0.74, 0.61, 0.33];
    const labels = ["doc#12 §3.2", "doc#07 §1.1", "doc#45 §9", "doc#03 §2", "doc#88 §5", "doc#21 §7"];
    const data = sim.map(function (s) { return Math.round(s * 100); });
    E.lineChart(canvas, [{ name: "cosine", color: "#22d3ee", data: data }], { legend: true });
    E.clear(chunks);
    labels.forEach(function (l, i) {
      chunks.appendChild(E.h("div", { class: "card" },
        E.h("div", { class: "flex between" }, E.h("strong", {}, l), E.h("span", { class: "badge green" }, sim[i].toFixed(2))),
        E.h("p", {}, "Relevant passage about " + (i === 0 ? "token bucket algorithm" : "request throttling and windowing") + ".")));
    });
    citation.innerHTML = "<p style='margin:0;color:var(--text)'>Rate limiting caps requests using a <b>token bucket</b> " +
      "(doc#12 §3.2) replenished at a fixed rate (doc#07 §1.1). Requests exceeding the bucket are rejected with <code>429</code> " +
      "(doc#45 §9).</p>";
  }
  E.on(btn, run); q.addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });
  run();
}

/* 3. AI Workflow Builder */
function view_workflow_builder(root) {
  const nodes = [
    { id: "in", label: "Input", sub: "prompt", accent: true },
    { id: "llm", label: "LLM", sub: "gpt-4o" },
    { id: "tool", label: "Tool", sub: "search" },
    { id: "cond", label: "Branch", sub: "if/else" },
    { id: "out", label: "Output", sub: "format" }
  ];
  const edges = [{ from: "in", to: "llm" }, { from: "llm", to: "tool" }, { from: "tool", to: "cond" }, { from: "cond", to: "out" }];
  const svg = E.h("svg", { class: "graph" });
  const yaml = E.h("pre", { class: "code" });
  const addBtn = E.h("button", { class: "btn" }, "+ Add node");
  root.appendChild(E.h("div", { class: "grid cols-2" },
    E.h("div", {}, panel("Workflow DAG", svg, addBtn)),
    E.h("div", {}, panel("Compiled LangChain YAML", yaml))));
  E.nodeGraph(svg, nodes, edges);
  yaml.innerHTML = E.highlight("steps:\n  - id: input\n    type: prompt_template\n    template: \"Answer: {question}\"\n  - id: llm\n    type: openai\n    model: gpt-4o\n    connects_to: [tool]\n  - id: tool\n    type: retriever\n    top_k: 6\n  - id: branch\n    type: conditional\n    if: confidence > 0.8\n  - id: output\n    type: json_output");
  let extra = 0;
  E.on(addBtn, function () {
    extra++;
    nodes.splice(nodes.length - 1, 0, { id: "x" + extra, label: "Step " + extra, sub: "transform" });
    edges.push({ from: "x" + extra, to: "out" });
    E.clear(svg); E.nodeGraph(svg, nodes, edges);
  });
}

/* 4. LLM API Gateway */
function view_gateway(root) {
  const keys = E.h("div", { class: "grid cols-3" });
  const canvas = E.h("canvas", { class: "chart" });
  const rotBtn = E.h("button", { class: "btn primary" }, "Rotate key");
  const status = E.h("div", { class: "badge green" }, "● all routes healthy");
  const ks = [
    { name: "pk_live_a1..", tier: "pro", rpm: 600, calls: 18420 },
    { name: "pk_live_7f..", tier: "free", rpm: 60, calls: 2310 },
    { name: "pk_live_9c..", tier: "enterprise", rpm: 5000, calls: 90211 }
  ];
  root.appendChild(E.h("div", { class: "panel" },
    E.h("div", { class: "panel-head" }, E.h("h3", {}, "API Keys"), rotBtn)));
  root.appendChild(keys);
  root.appendChild(E.h("div", { class: "mt-2 grid cols-2" },
    E.h("div", {}, panel("Requests / minute", canvas, status)),
    E.h("div", {}, panel("Rate Limit Tiers", E.h("div", {},
      ks.map(function (k) { return E.h("div", { class: "bar-row" },
        E.h("div", { class: "name" }, k.name),
        E.h("div", { class: "bar-track" }, E.h("div", { class: "bar-fill", style: "width:" + (k.rpm / 50) + "%" })),
        E.h("div", { class: "name", style: "width:auto" }, k.tier + " · " + k.rpm + "/min")); }))))));
  ks.forEach(function (k) { keys.appendChild(E.h("div", { class: "card" },
    E.h("div", { class: "flex between" }, E.h("strong", {}, k.tier), E.h("span", { class: "badge blue" }, E.fmt(k.calls) + " calls")),
    E.h("p", { style: "font-family:var(--mono);font-size:13px" }, k.name),
    E.h("div", { class: "tags" }, E.h("span", { class: "tag" }, "JWT"), E.h("span", { class: "tag" }, "Redis")))); });
  let t = 40;
  function draw() {
    const data = Array.from({ length: 24 }, function (_, i) { return Math.round(800 + Math.sin(i / 2) * 300 + E.rand(-120, 120) + t); });
    E.lineChart(canvas, [{ name: "req/min", color: "#6d7cff", data: data }], { legend: true });
  }
  draw();
  setInterval(draw, 2500);
  E.on(rotBtn, function () { ks[0].name = "pk_live_" + Math.random().toString(36).slice(2, 4) + ".."; E.toast("Key rotated · old key revoked"); });
}

/* 5. Prompt Trace Viewer */
function view_trace_viewer(root) {
  const tl = E.h("div", { class: "timeline" });
  const stats = E.h("div", { class: "stats" });
  const spans = [
    { t: "0.0ms", name: "ChatChain.invoke", dur: 1072, detail: "root chain" },
    { t: "12ms", name: "PromptTemplate.format", dur: 3, detail: "12 variables" },
    { t: "30ms", name: "Retriever.get_relevant", dur: 118, detail: "k=6 · pgvector" },
    { t: "180ms", name: "OpenAI.chat.completions", dur: 540, detail: "518 tok · $0.004" },
    { t: "760ms", name: "OutputParser.parse", dur: 8, detail: "JSON schema" },
    { t: "900ms", name: "Critic.evaluate", dur: 88, detail: "confidence 0.91" }
  ];
  root.appendChild(E.h("div", { class: "grid cols-3" },
    E.h("div", { style: "grid-column: span 2" }, panel("Trace Timeline", tl)),
    E.h("div", {}, panel("Totals", stats))));
  spans.forEach(function (s) { tl.appendChild(E.h("div", { class: "tl-item" },
    E.h("div", { class: "t" }, s.t + " · " + s.dur + "ms"),
    E.h("div", {}, s.name),
    E.h("p", { class: "muted", style: "font-size:13px;margin:4px 0 0" }, s.detail))); });
  const items = [
    { v: 1072, l: "Latency (ms)" }, { v: 524, l: "Prompt tokens" },
    { v: 518, l: "Completion tok" }, { v: 1, l: "Errors" }
  ];
  items.forEach(function (it) {
    const num = E.h("div", { class: "num" }, "0");
    stats.appendChild(E.h("div", { class: "stat" }, num, E.h("div", { class: "lbl" }, it.l)));
    setTimeout(function () { E.countUp(num, it.v); }, 200);
  });
}

/* 6. AI Model Router */
function view_router(root) {
  const canvas = E.h("canvas", { class: "chart" });
  const table = E.h("div", { class: "grid cols-3" });
  const routeBtn = E.h("button", { class: "btn primary" }, "Send 1k requests");
  const weights = { "gpt-4o": 50, "claude-3.5": 30, "llama-3": 20 };
  const stats = { "gpt-4o": { n: 0, lat: 540, cost: 0.004 }, "claude-3.5": { n: 0, lat: 610, cost: 0.003 }, "llama-3": { n: 0, lat: 320, cost: 0.0008 } };
  root.appendChild(E.h("div", { class: "panel" },
    E.h("div", { class: "panel-head" }, E.h("h3", {}, "Weighted A/B Routing"), routeBtn)));
  root.appendChild(E.h("div", { class: "grid cols-3 mt-1" },
    Object.keys(weights).map(function (m) { return E.h("div", { class: "card" },
      E.h("div", { class: "flex between" }, E.h("strong", {}, m), E.h("span", { class: "badge blue" }, weights[m] + "%")),
      E.h("div", { class: "bar-track", style: "margin-top:10px" }, E.h("div", { class: "bar-fill", style: "width:" + weights[m] + "%" }))); })));
  root.appendChild(E.h("div", { class: "mt-2 grid cols-2" },
    E.h("div", {}, panel("Distribution", canvas)),
    E.h("div", {}, panel("Live Metrics", table))));
  function draw() {
    const d = Object.keys(stats).map(function (k) { return stats[k].n; });
    const arr = Array(24).fill(0).map(function (_, i) { return d[i] || 0; });
    E.lineChart(canvas, [{ name: "routed", color: "#a855f7", data: arr }], { legend: true });
  }
  function refresh() {
    E.clear(table);
    Object.keys(stats).forEach(function (m) {
      const s = stats[m];
      table.appendChild(E.h("div", { class: "card" }, E.h("strong", {}, m),
        E.h("p", {}, E.fmt(s.n) + " reqs · " + s.lat + "ms · $" + (s.n * s.cost).toFixed(2))));
    });
  }
  E.on(routeBtn, function () {
    for (let i = 0; i < 1000; i++) {
      const r = Math.random() * 100, m = r < 50 ? "gpt-4o" : r < 80 ? "claude-3.5" : "llama-3";
      stats[m].n++;
    }
    refresh(); draw(); E.toast("Routed 1,000 requests");
  });
  refresh();
}

/* 7. FastAPI REST Explorer */
function view_fastapi_explore(root) {
  const schemas = {
    "POST /auth/token": { request: "{ username: str, password: str }", response: "{ access_token: str, token_type: 'bearer' }", status: 200 },
    "GET /items": { request: "?limit=20&offset=0", response: "[Item]", status: 200, auth: true },
    "POST /items": { request: "ItemCreate", response: "Item", status: 201, auth: true },
    "DELETE /items/{id}": { request: "id: int", response: "null", status: 204, auth: true },
    "GET /users/me": { request: "-", response: "User", status: 200, auth: true }
  };
  const sel = E.h("select", {},
    ...Object.keys(schemas).map(function (k) { return E.h("option", { value: k }, k); }));
  const resp = E.h("pre", { class: "code" });
  const sendBtn = E.h("button", { class: "btn primary" }, "Send request");
  root.appendChild(E.h("div", { class: "panel" },
    E.h("div", { class: "panel-head" }, E.h("h3", {}, "OpenAPI Explorer"), E.h("span", { class: "badge blue" }, "Swagger")),
    E.h("div", { class: "row" }, sel, sendBtn)));
  root.appendChild(E.h("div", { class: "mt-2" }, panel("Response", resp)));
  function send() {
    const k = sel.value, s = schemas[k];
    const latency = Math.round(20 + Math.random() * 90);
    resp.innerHTML = E.highlight(
      "HTTP " + s.status + " " + k + "\n" +
      "X-Process-Time: " + latency + "ms\n" +
      "Authorization: " + (s.auth ? "Bearer <token>" : "(none)") + "\n\n" +
      "< " + s.response);
    E.toast(k + " · " + latency + "ms");
  }
  E.on(sendBtn, send); send();
}

/* 8. NestJS Modular API */
function view_nestjs_explore(root) {
  const modules = ["AuthModule", "UserModule", "ItemModule", "PaymentModule", "GatewayModule", "WebhookModule"];
  const svg = E.h("svg", { class: "graph" });
  const code = E.h("pre", { class: "code" });
  root.appendChild(E.h("div", { class: "grid cols-2" },
    E.h("div", {}, panel("Module DI Graph", svg)),
    E.h("div", {}, panel("users.controller.ts", code))));
  const nodes = modules.map(function (m, i) {
    return { id: m, label: m, sub: "module", accent: i === 0 };
  });
  const edges = [
    { from: "AuthModule", to: "UserModule" }, { from: "UserModule", to: "ItemModule" },
    { from: "ItemModule", to: "PaymentModule" }, { from: "GatewayModule", to: "AuthModule" },
    { from: "WebhookModule", to: "PaymentModule" }
  ];
  E.nodeGraph(svg, nodes, edges);
  code.innerHTML = E.highlight("@Controller('users')\nexport class UsersController {\n  constructor(\n    private readonly users: UsersService,\n    @Inject('USER_REPO') private readonly repo: Repository<User>,\n  ) {}\n\n  @Post()\n  @UseGuards(JwtAuthGuard, RolesGuard)\n  @Roles('admin')\n  async create(@Body() dto: CreateUserDto): Promise<User> {\n    return this.users.create(dto);\n  }\n}");
}

/* 9. Go Rate Limiter */
function view_rate_limiter(root) {
  const canvas = E.h("canvas", { class: "chart" });
  const btn = E.h("button", { class: "btn primary" }, "Burst 500 reqs");
  const allowed = E.h("div", { class: "num" }, "0");
  const dropped = E.h("div", { class: "num" }, "0");
  root.appendChild(E.h("div", { class: "panel" },
    E.h("div", { class: "panel-head" }, E.h("h3", {}, "Token Bucket"), btn)));
  root.appendChild(E.h("div", { class: "grid cols-2 mt-1" },
    E.h("div", { class: "stat" }, allowed, E.h("div", { class: "lbl" }, "Allowed")),
    E.h("div", { class: "stat" }, dropped, E.h("div", { class: "lbl" }, "429 Too Many"))));
  root.appendChild(E.h("div", { class: "mt-2" }, panel("Throughput (req/s)", canvas)));
  let t = 0;
  const series = Array(40).fill(0);
  function tick() {
    t++;
    series.shift();
    series.push(Math.round(80 + Math.random() * 40));
    E.lineChart(canvas, [{ name: "allowed", color: "#34d399", data: series.slice(0, 24) }, { name: "429", color: "#f87171", data: series.slice(0, 24).map(function (v) { return Math.random() * 8; }) }], { legend: true });
  }
  setInterval(tick, 900);
  tick();
  E.on(btn, function () {
    const a = Math.round(380 + Math.random() * 100), d = 500 - 430;
    E.countUp(allowed, a); E.countUp(dropped, d); E.toast("500 reqs · " + a + " allowed · " + d + " rejected");
  });
}

/* 10. API Gateway Dashboard */
function view_gateway_metrics(root) {
  const canvas = E.h("canvas", { class: "chart" });
  const routes = E.h("div", { class: "grid cols-2" });
  root.appendChild(E.h("div", { class: "mt-1" }, panel("Latency p50/p95/p99 (ms)", canvas)));
  root.appendChild(E.h("div", { class: "mt-2" }, panel("Route Health", routes)));
  const rs = [
    { name: "/v1/auth", p99: 42, err: 0.01, code: 200 },
    { name: "/v1/items", p99: 118, err: 0.03, code: 200 },
    { name: "/v1/payments", p99: 240, err: 0.08, code: 500 },
    { name: "/v1/webhooks", p99: 90, err: 0.005, code: 200 }
  ];
  rs.forEach(function (r) {
    routes.appendChild(E.h("div", { class: "card" },
      E.h("div", { class: "flex between" }, E.h("code", {}, r.name), E.h("span", { class: r.code == 200 ? "badge green" : "badge red" }, String(r.code))),
      E.h("p", {}, "p99 " + r.p99 + "ms · err " + (r.err * 100).toFixed(2) + "%")));
  });
  const p50 = Array.from({ length: 24 }, function () { return Math.round(40 + Math.random() * 20); });
  const p95 = p50.map(function (v) { return v + 80; });
  const p99 = p95.map(function (v) { return v + 60; });
  function draw() {
    E.lineChart(canvas, [
      { name: "p50", color: "#34d399", data: p50 },
      { name: "p95", color: "#fbbf24", data: p95 },
      { name: "p99", color: "#f87171", data: p99 }
    ], { legend: true });
  }
  setInterval(function () {
    p50.shift(); p50.push(Math.round(40 + Math.random() * 20));
    p95.shift(); p95.push(p50[p50.length - 1] + 80);
    p99.shift(); p99.push(p95[p95.length - 1] + 60);
    draw();
  }, 2200);
  draw();
}

/* 11. Celery Worker Monitor */
function view_celery_monitor(root) {
  const queues = E.h("div", { class: "grid cols-3" });
  const canvas = E.h("canvas", { class: "chart" });
  root.appendChild(E.h("div", { class: "mt-1" }, panel("Queues", queues)));
  root.appendChild(E.h("div", { class: "mt-2" }, panel("Task throughput (tasks/s)", canvas)));
  const qs = [
    { n: "default", p: 12, c: 4, w: 3 },
    { n: "high-priority", p: 3, c: 4, w: 1 },
    { n: "etl", p: 87, c: 4, w: 6 },
    { n: "dlq", p: 5, c: 0, w: 0 }
  ];
  qs.forEach(function (q) {
    queues.appendChild(E.h("div", { class: "card" },
      E.h("div", { class: "flex between" }, E.h("strong", {}, q.n), E.h("span", { class: "badge " + (q.p > 50 ? "amber" : "green") }, q.p + " pending")),
      E.h("p", {}, "consumers: " + q.c + " · workers: " + q.w)));
  });
  let s = Array(24).fill(0).map(function () { return Math.round(20 + Math.random() * 40); });
  function draw() { E.lineChart(canvas, [{ name: "tasks/s", color: "#a855f7", data: s }], { legend: true }); }
  setInterval(function () { s.shift(); s.push(Math.round(20 + Math.random() * 40)); draw(); }, 1500);
  draw();
}

/* 12. WebSocket Realtime Chat */
function view_ws_chat(root) {
  const msgs = E.h("div", { style: "height:260px;overflow:auto;border:1px solid var(--border);border-radius:10px;padding:12px;background:var(--bg-2);display:flex;flex-direction:column;gap:8px" });
  const input = E.h("input", { placeholder: "Type a message..." });
  const send = E.h("button", { class: "btn primary" }, "Send");
  const presence = E.h("div", { class: "badge green" }, "● 3 online");
  root.appendChild(E.h("div", { class: "panel" },
    E.h("div", { class: "panel-head" }, E.h("h3", {}, "Realtime Room"), presence)));
  root.appendChild(E.h("div", { class: "mt-1" }, msgs));
  root.appendChild(E.h("div", { class: "row mt-1" }, input, send));
  function add(who, txt, mine) {
    const bubble = E.h("div", { style: "max-width:80%;padding:8px 12px;border-radius:12px;background:" + (mine ? "var(--accent)" : "var(--surface-2)") + ";color:" + (mine ? "#06121f" : "var(--text)") + ";align-self:" + (mine ? "flex-end" : "flex-start") });
    bubble.innerHTML = "<small style='opacity:.7;display:block'>" + who + "</small>" + txt;
    msgs.appendChild(bubble);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function push() {
    const txt = input.value.trim(); if (!txt) return;
    add("you", txt, true); input.value = "";
    setTimeout(function () { add("bot", "Echoing across the broisson: \"" + txt + "\" ⚡", false); }, 700);
  }
  E.on(send, push); input.addEventListener("keydown", function (e) { if (e.key === "Enter") push(); });
  add("system", "Welcome to the demo realtime room (in-browser, no backend here 🙌)", false);
}

/* 13. Next.js SSR Showcase */
function view_nextjs_ssr(root) {
  const canvas = E.h("canvas", { class: "chart" });
  const table = E.h("div", { class: "grid cols-2" });
  root.appendChild(E.h("div", { class: "mt-1" }, panel("Time-to-First-Byte (ms) by rendering strategy", canvas)));
  root.appendChild(E.h("div", { class: "mt-2" }, panel("Strategy comparison", table)));
  const rows = [
    { name: "Client (CSR)", ttfb: 30, tti: 1800, note: "Fast shell, slow interactive" },
    { name: "SSG", ttfb: 12, tti: 90, note: "Pre-rendered HTML, fastest cache hits" },
    { name: "SSR", ttfb: 110, tti: 240, note: "Per-request render, fresh data" },
    { name: "ISR", ttfb: 18, tti: 110, note: "Cached HTML, revalidates per window" }
  ];
  rows.forEach(function (r) {
    table.appendChild(E.h("div", { class: "card" },
      E.h("strong", {}, r.name),
      E.h("p", {}, "TTFB " + r.ttfb + "ms · TTI " + r.tti + "ms"),
      E.h("p", { class: "muted", style: "font-size:13px" }, r.note)));
  });
  E.lineChart(canvas, [
    { name: "TTFB", color: "#6d7cff", data: rows.map(function (r) { return r.ttfb; }) },
    { name: "TTI", color: "#22d3ee", data: rows.map(function (r) { return r.tti; }) }
  ], { legend: true });
}

/* 14. React Design System */
function view_design_system(root) {
  const grid = E.h("div", { class: "grid cols-2" });
  const demoBtn = E.h("button", { class: "btn primary" }, "Primary");
  const demoBtn2 = E.h("button", { class: "btn" }, "Secondary");
  const demoInput = E.h("input", { placeholder: "you@example.com" });
  const tag = E.h("span", { class: "tag accent" }, "<Badge>");
  const seg = E.h("div", { class: "flex" },
    E.h("div", { class: "btn ghost" }, "All"), E.h("div", { class: "btn primary" }, "Active"), E.h("div", { class: "btn ghost" }, "Done"));
  const card = E.h("div", { class: "card" }, E.h("h3", {}, "Card"), E.h("p", {}, "Default spacing scale 4-8-12-16-24-32."));
  const palette = E.h("div", { class: "flex" },
    ["#6d7cff", "#22d3ee", "#a855f7", "#34d399", "#fbbf24"].map(function (c) {
      return E.h("div", { style: "width:36px;height:36px;border-radius:10px;background:" + c + ";border:1px solid rgba(255,255,255,.1)" });
    }));
  grid.appendChild(E.h("div", { class: "card" }, E.h("h3", {}, "Buttons"), E.h("div", { class: "flex mt-1" }, demoBtn, demoBtn2)));
  grid.appendChild(E.h("div", { class: "card" }, E.h("h3", {}, "Inputs"), demoInput));
  grid.appendChild(E.h("div", { class: "card" }, E.h("h3", {}, "Badges & Tags"), E.h("div", { class: "flex mt-1" }, tag, E.h("span", { class: "badge green" }, "badge"))));
  grid.appendChild(E.h("div", { class: "card" }, E.h("h3", {}, "Segmented"), seg));
  grid.appendChild(card);
  grid.appendChild(E.h("div", { class: "card" }, E.h("h3", {}, "Palette"), E.h("div", { class: "mt-1" }, palette)));
  root.appendChild(E.h("div", {}, grid));
  root.appendChild(E.h("div", { class: "mt-2 card" }, E.h("h3", {}, "Tokens"), E.h("pre", { class: "code", html: E.highlight("--radius: 12px;\n--accent: #6d7cff;\n--shadow: 0 20px 60px -20px rgba(0,0,0,.6);\nfont: Inter, system-ui;") })));
}

/* 15. Nuxt RTL Dashboard */
function view_nuxt_dashboard(root) {
  const kpisRow = statRow([
    { v: 18420, l: "Revenue" }, { v: 92, l: "Active users" },
    { v: 0.034, l: "Churn", suffix: "" }, { v: 8, l: "Apps", suffix: "" }
  ]);
  const canvas = E.h("canvas", { class: "chart" });
  const rtlToggle = E.h("button", { class: "btn" }, "Toggle RTL/FA");
  root.appendChild(E.h("div", { class: "mt-1" }, kpisRow));
  root.appendChild(E.h("div", { class: "mt-2 grid cols-2" },
    E.h("div", {}, panel("Monthly revenue", canvas, rtlToggle)),
    E.h("div", {}, panel("Bilingual note", E.h("p", {}, "Bilingual FA/EN layout: this dashboard ships with Persian RTL by default and flips cleanly to LTR English.")))));
  E.lineChart(canvas, [{ name: "revenue", color: "#22d3ee", data: Array.from({ length: 24 }, function (_, i) { return Math.round(8000 + Math.sin(i / 3) * 1500 + Math.random() * 600); }) }], { legend: true });
  let rtl = true;
  E.on(rtlToggle, function () {
    rtl = !rtl; document.body.style.direction = rtl ? "rtl" : "ltr"; document.body.style.textAlign = rtl ? "right" : "left";
    E.toast(rtl ? "RTL / Persian" : "LTR / English");
  });
}

/* 16. Vite Portfolio Theme */
function view_portfolio_theme(root) {
  const hero = E.h("div", { style: "padding:48px 24px;border-radius:16px;background:var(--surface);border:1px solid var(--border);text-align:center" });
  hero.innerHTML = "<div class='eyebrow'>portfolio template</div><h2 style='margin:0 0 6px'>Studio of <span class='grad-text'>Hessam</span>.</h2><p class='muted'>Scroll-bound GSAP animations · editorial layout · minimal palette.</p>";
  const blocks = E.h("div", { class: "grid cols-3 mt-2" });
  ["Work", "About", "Process", "Index", "Press", "Contact"].forEach(function (t) {
    blocks.appendChild(E.h("div", { class: "card" }, E.h("h3", {}, t), E.h("p", {}, "Section with scroll-pinned reveal and editorial typography.")));
  });
  root.appendChild(hero);
  root.appendChild(blocks);
  root.appendChild(E.h("div", { class: "mt-2 card" },
    E.h("h3", {}, "GSAP snippet"), E.h("pre", { class: "code", html: E.highlight("gsap.from('.card', {\n  scrollTrigger: { trigger: '.card', start: 'top 80%' },\n  y: 60, opacity: 0, stagger: 0.12,\n  ease: 'power3.out'\n});") })));
}

/* 17. TypeScript Data Table */
function view_data_table(root) {
  const headBtnSort = function (name) { return E.h("button", { class: "btn ghost", style: "padding:4px 10px;font-size:13px" }, name + " ↕"); };
  const tblHead = E.h("div", { class: "flex", style: "gap:8px;padding:10px 12px;border-bottom:1px solid var(--border);background:var(--surface)" },
    headBtnSort("name"), headBtnSort("status"), headBtnSort("latency"));
  const rowsWrap = E.h("div", { style: "max-height:220px;overflow:auto" });
  const search = E.h("input", { placeholder: "Filter rows..." });
  const data = [
    ["auth-svc", "ok", 42], ["items-api", "ok", 118], ["payments", "degraded", 240],
    ["webhooks", "ok", 90], ["gateway", "ok", 16], ["cache", "down", 0]
  ];
  function render(q) {
    E.clear(rowsWrap);
    data.filter(function (r) { return !q || r[0].toLowerCase().includes(q.toLowerCase()); }).forEach(function (r) {
      rowsWrap.appendChild(E.h("div", { class: "flex", style: "padding:10px 12px;border-bottom:1px solid var(--border);font-size:13px" },
        E.h("div", { style: "flex:1" }, r[0]),
        E.h("div", { style: "flex:1" }, E.h("span", { class: "badge " + (r[1] == "ok" ? "green" : r[1] == "degraded" ? "amber" : "red") }, r[1])),
        E.h("div", { style: "flex:1" }, r[2] + "ms")));
    });
  }
  root.appendChild(E.h("div", { class: "panel" },
    E.h("div", { class: "panel-head" }, E.h("h3", {}, "Virtualized table"),
      E.h("span", { class: "badge blue" }, "100k rows capable"))));
  root.appendChild(E.h("div", { class: "mt-1", style: "max-width:340px;margin-bottom:10px" }, search));
  const card = E.h("div", { class: "panel", style: "padding:0;overflow:hidden" });
  card.appendChild(tblHead); card.appendChild(rowsWrap);
  root.appendChild(card);
  search.addEventListener("input", function () { render(search.value); });
  render("");
}

/* 18. Docker Compose Starter */
function view_compose_starter(root) {
  const canvas = E.h("canvas", { class: "chart" });
  const code = E.h("pre", { class: "code" });
  root.appendChild(E.h("div", { class: "grid cols-2" },
    E.h("div", {}, panel("Service topology", code)),
    E.h("div", {}, panel("Container CPU (live)", canvas))));
  code.innerHTML = E.highlight("services:\n  api:\n    build: ./api\n    ports: ['3000:3000']\n    depends_on: [postgres, redis]\n  worker:\n    build: ./worker\n    command: celery -A app worker\n  postgres:\n    image: postgres:16\n    volumes: ['pgdata:/var/lib/postgresql']\n  redis:\n    image: redis:7\n  nginx:\n    image: nginx:1.27\n    ports: ['80:80']\nvolumes:\n  pgdata:");
  const s = Array(24).fill(0).map(function () { return Math.round(20 + Math.random() * 30); });
  function draw() { E.lineChart(canvas, [{ name: "cpu%", color: "#22d3ee", data: s }], { legend: true }); }
  setInterval(function () { s.shift(); s.push(Math.round(20 + Math.random() * 30)); draw(); }, 1500);
  draw();
}

/* 19. Cloudflare Worker Template */
function view_worker_template(root) {
  const canvas = E.h("canvas", { class: "chart" });
  const code = E.h("pre", { class: "code" });
  const btn = E.h("button", { class: "btn primary" }, "Hit edge");
  root.appendChild(E.h("div", { class: "grid cols-2" },
    E.h("div", {}, panel("Worker handler", code, btn)),
    E.h("div", {}, panel("Edge latency (ms)", canvas, E.h("span", { class: "badge blue" }, "KV cache")))));
  code.innerHTML = E.highlight("export default {\n  async fetch(req, env) {\n    const url = new URL(req.url);\n    const cached = await env.KV.get(url.pathname);\n    if (cached) return new Response(cached, { headers: { 'x-cache': 'HIT' } });\n    const res = await fetch(req);\n    await env.KV.put(url.pathname, await res.text(), { expirationTtl: 60 });\n    return new Response(res.body, { headers: { 'x-cache': 'MISS' } });\n  }\n}");
  let lat = [];
  function draw() { E.lineChart(canvas, [{ name: "edge ms", color: "#f6821f", data: lat.length ? lat : Array(24).fill(0) }], { legend: true }); }
  function hit() { lat.push(Math.round(8 + Math.random() * 22)); if (lat.length > 24) lat.shift(); draw(); E.toast("Edge responded " + lat[lat.length - 1] + "ms"); }
  E.on(btn, hit); draw();
}

/* 20. GitHub Actions Library */
function view_actions_lib(root) {
  const list = E.h("div", { class: "grid cols-2" });
  const chart = E.h("canvas", { class: "chart" });
  root.appendChild(E.h("div", { class: "mt-1" }, panel("Reusable workflows", list)));
  root.appendChild(E.h("div", { class: "mt-2" }, panel("CI pipeline duration (min)", chart)));
  const wf = [
    ["ci-node.yml", "test · build · lint"],
    ["ci-python.yml", "pytest · mypy · ruff"],
    ["ci-go.yml", "go test · vet · build"],
    ["deploy-pages.yml", "build → Pages"],
    ["docker-publish.yml", "buildx · push"],
    ["security-scan.yml", "trivy · gitleaks"]
  ];
  wf.forEach(function (w) { list.appendChild(E.h("div", { class: "card" }, E.h("strong", {}, w[0]), E.h("p", {}, w[1]))); });
  const s = Array(24).fill(0).map(function () { return Math.round(2 + Math.random() * 4); });
  function draw() { E.lineChart(canvas, chart, { name: "min", color: "#a855f7", data: s }); }
  setInterval(function () { s.shift(); s.push(Math.round(2 + Math.random() * 4)); draw(); }, 2000);
  draw();
}

/* 21. Nginx Reverse Proxy Kit */
function view_nginx_kit(root) {
  const upstream = E.h("input", { value: "127.0.0.1:3000 127.0.0.1:3001" });
  const tls = E.h("button", { class: "btn" }, "Toggle TLS");
  const out = E.h("pre", { class: "code" });
  root.appendChild(E.h("div", { class: "panel" },
    E.h("div", { class: "panel-head" }, E.h("h3", {}, "Generator"), tls),
    E.h("div", { class: "field" }, E.h("label", {}, "Upstream servers (space-separated)"), upstream)));
  root.appendChild(E.h("div", { class: "mt-2" }, panel("Generated nginx.conf", out)));
  let secure = true;
  function gen() {
    const ups = upstream.value.split(/\s+/).filter(Boolean).map(function (u, i) { return "    server " + u + ";"; }).join("\n");
    out.innerHTML = E.highlight(
      "upstream app {\n" + ups + "\n}\n\nserver {\n    listen " + (secure ? "443 ssl;" : "80;") + "\n    server_name example.com;\n" +
      (secure ? "    ssl_certificate /etc/letsencrypt/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/privkey.pem;\n" : "") +
      "    gzip on;\n    location / {\n        proxy_pass http://app;\n        proxy_set_header Host $host;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n    }\n}");
  }
  E.on(tls, function () { secure = !secure; gen(); E.toast(secure ? "TLS enabled" : "TLS disabled"); });
  upstream.addEventListener("input", gen); gen();
}

/* 22. VPS Deploy Playbook */
function view_vps_playbook(root) {
  const steps = [
    "Provision droplet (Ubuntu 24.04, 2vCPU)",
    "Harden SSH (disable root, key-only, UFW 22/80/443)",
    "Install Docker + compose plugin",
    "Pull images & run db migrations",
    "Zero-downtime swap (blue/green)",
    "Healthcheck & rollback hook"
  ];
  const box = E.h("div", { class: "timeline" });
  steps.forEach(function (s, i) {
    box.appendChild(E.h("div", { class: "tl-item" },
      E.h("div", { class: "t" }, "step " + (i + 1)),
      E.h("div", {}, s)));
  });
  const progress = E.h("div", { class: "bar-track", style: "height:14px" }, E.h("div", { class: "bar-fill" }));
  const runBtn = E.h("button", { class: "btn primary" }, "Run playbook");
  root.appendChild(E.h("div", { class: "panel" },
    E.h("div", { class: "panel-head" }, E.h("h3", {}, "Zero-downtime deploy"), runBtn)));
  root.appendChild(E.h("div", { class: "mt-1" }, progress));
  root.appendChild(E.h("div", { class: "mt-2" }, panel("Steps", box)));
  E.on(runBtn, function () {
    progress.querySelector(".bar-fill").style.width = "100%";
    E.toast("Playbook executed · rollback ready");
  });
}

/* 23. Xray Config Generator */
function view_xray_gen(root) {
  const uuid = E.h("input", { value: "f47ac10b-58cc-4372-a567-0e02b2c3d479" });
  const proto = E.h("select", {}, E.h("option", { value: "vless" }, "VLESS"), E.h("option", { value: "vmess" }, "VMess"));
  const reality = E.h("button", { class: "btn" }, "Toggle Reality");
  const serverOut = E.h("pre", { class: "code" });
  const clientOut = E.h("pre", { class: "code" });
  root.appendChild(E.h("div", { class: "panel" },
    E.h("div", { class: "panel-head" }, E.h("h3", {}, "Generator"), reality),
    E.h("div", { class: "row" },
      E.h("div", { class: "field" }, E.h("label", {}, "Protocol"), proto),
      E.h("div", { class: "field flex-2" }, E.h("label", {}, "UUID"), uuid))));
  root.appendChild(E.h("div", { class: "mt-2 grid cols-2" },
    E.h("div", {}, panel("Server config", serverOut)),
    E.h("div", {}, panel("Client config", clientOut))));
  let useReality = true;
  function gen() {
    const p = proto.value;
    serverOut.innerHTML = E.highlight(
      "{\n  \"inbounds\": [{\n    \"port\": 443,\n    \"protocol\": \"" + p + "\",\n    \"settings\": { \"clients\": [{ \"id\": \"" + uuid.value + "\" }] },\n    \"streamSettings\": {\n      \"network\": \"tcp\",\n      \"security\": \"reality\",\n      \"realitySettings\": { \"show\": true }\n    }\n  }]\n}");
    clientOut.innerHTML = E.highlight(
      "{\n  \"outbounds\": [{\n    \"protocol\": \"" + p + "\",\n    \"settings\": { \"vnext\": [{ \"address\": \"your.host\", \"port\": 443, \"users\": [{ \"id\": \"" + uuid.value + "\" }] }] },\n    \"streamSettings\": { \"security\": \"" + (useReality ? "reality" : "tls") + "\" }\n  }]\n}");
  }
  E.on(reality, function () { useReality = !useReality; gen(); E.toast("Reality " + (useReality ? "on" : "off")); });
  proto.addEventListener("change", gen); uuid.addEventListener("input", gen); gen();
}

/* 24. JWT Inspector */
function view_jwt_inspector(root) {
  const sample = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikhlc2FtIEthemVtaSIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  const input = E.h("input", { value: sample });
  const header = E.h("pre", { class: "code" });
  const payload = E.h("pre", { class: "code" });
  const sig = E.h("div", { class: "badge green" }, "signature: valid (HS256)");
  const timeline = E.h("div", { class: "timeline" });
  root.appendChild(E.h("div", { class: "panel" },
    E.h("div", { class: "panel-head" }, E.h("h3", {}, "Decode token"), sig),
    E.h("div", { class: "field" }, input)));
  root.appendChild(E.h("div", { class: "mt-2 grid cols-2" },
    E.h("div", {}, panel("Header", header)),
    E.h("div", {}, panel("Payload", payload))));
  root.appendChild(E.h("div", { class: "mt-2" }, panel("Claims timeline", timeline)));
  function decode() {
    try {
      const parts = input.value.split(".");
      const h = JSON.parse(atob(parts[0]));
      const p = JSON.parse(atob(parts[1]));
      header.innerHTML = E.highlight(JSON.stringify(h, null, 2));
      payload.innerHTML = E.highlight(JSON.stringify(p, null, 2));
      E.clear(timeline);
      Object.keys(p).forEach(function (k) {
        timeline.appendChild(E.h("div", { class: "tl-item" },
          E.h("div", { class: "t" }, k), E.h("div", {}, String(p[k]))));
      });
      sig.className = "badge green"; sig.textContent = "signature: valid (HS256)";
    } catch (e) {
      sig.className = "badge red"; sig.textContent = "invalid token";
    }
  }
  input.addEventListener("input", decode); decode();
}

/* 25. API Key Vault UI */
function view_key_vault(root) {
  const keysList = E.h("div", { class: "grid cols-2" });
  const audit = E.h("div", { class: "timeline" });
  const scopes = ["read", "write", "admin", "billing", "webhook"];
  let keys = [
    { name: "pk_live_d4...", owner: "ci-bot", sc: ["read", "write"], masked: true },
    { name: "pk_live_9c...", owner: "analytics", sc: ["read"], masked: true },
    { name: "sk_live_a1...", owner: "payments", sc: ["admin", "billing"], masked: true }
  ];
  function render() {
    E.clear(keysList);
    keys.forEach(function (k) {
      keysList.appendChild(E.h("div", { class: "card" },
        E.h("div", { class: "flex between" }, E.h("strong", {}, k.masked ? "•".repeat(8) + k.name.slice(-4) : k.name), E.h("span", { class: "badge blue" }, k.owner)),
        E.h("div", { class: "tags" }, k.sc.map(function (s) { return E.h("span", { class: "tag" }, s); }))));
    });
  }
  function renderAudit() {
    E.clear(audit);
    [["10:42", "key pk_live_d4 rotated"], ["09:11", "scope added: webhook"], ["08:30", "key sk_live_a1 created"], ["07:55", "masked view by admin"]].forEach(function (a) {
      audit.appendChild(E.h("div", { class: "tl-item" }, E.h("div", { class: "t" }, a[0]), E.h("div", {}, a[1])));
    });
  }
  root.appendChild(E.h("div", { class: "mt-1" }, panel("Vault keys", keysList)));
  root.appendChild(E.h("div", { class: "mt-2" }, panel("Audit log", audit)));
  render(); renderAudit();
}

function view_fallback(root) {
  root.appendChild(E.h("div", { class: "card" }, E.h("h3", {}, "Coming soon"), E.h("p", {}, "Interactive demo for this project.")));
}
