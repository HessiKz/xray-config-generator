/* Project manifest - generated. Author: Hesam Kazemi (@HessiKz) */
window.MANIFEST = {
  "author": {
    "name": "Hesam Kazemi",
    "github": "HessiKz",
    "email": "hessi.kz@gmail.com",
    "role": "Full-Stack & AI Developer",
    "resume_url": "https://hessikz.github.io/My-Resume/"
  },
  "projects": [
    {
      "id": "ai-agent-playground",
      "name": "AI Agent Playground",
      "category": "AI / LangChain",
      "stack": [
        "LangChain",
        "TypeScript",
        "Vite",
        "SVG"
      ],
      "blurb": "Multi-agent orchestration UI with LangSmith-style trace timelines, dependencies, and prompt chains - simulated client-side so it runs on a static host.",
      "view": "agent_playground",
      "accent": "#6d7cff"
    },
    {
      "id": "rag-knowledge-base",
      "name": "RAG Knowledge Base",
      "category": "AI / LLM",
      "stack": [
        "FastAPI",
        "LangChain",
        "pgvector",
        "React",
        "Vite"
      ],
      "blurb": "Retrieval-Augmented Generation pipeline demo: chunking, embedding, vector search visualization, and citation panel.",
      "view": "rag_kb",
      "accent": "#22d3ee"
    },
    {
      "id": "ai-workflow-builder",
      "name": "AI Workflow Builder",
      "category": "AI / LangChain",
      "stack": [
        "LangChain",
        "LangSmith",
        "Go",
        "Vite",
        "D3"
      ],
      "blurb": "Drag-drop LangChain workflow editor: chain prompts, tools, retrievers, and inspect the resulting DAG.",
      "view": "workflow_builder",
      "accent": "#a855f7"
    },
    {
      "id": "llm-gateway-ui",
      "name": "LLM API Gateway",
      "category": "AI / Backend",
      "stack": [
        "FastAPI",
        "JWT",
        "Redis",
        "React",
        "Docker"
      ],
      "blurb": "API gateway dashboard: rate-limiting, auth tiers, key rotation, route health - mirrors ArnitEx/ArnitEx gateway work.",
      "view": "gateway",
      "accent": "#6d7cff"
    },
    {
      "id": "ai-summary",
      "name": "Prompt Trace Viewer",
      "category": "AI / LangSmith",
      "stack": [
        "LangSmith",
        "FastAPI",
        "Vite",
        "Tailwind"
      ],
      "blurb": "LangSmith-style trace and span timeline with token usage, cost, and latency breakdowns per chain step.",
      "view": "trace_viewer",
      "accent": "#22d3ee"
    },
    {
      "id": "ai-chat-router",
      "name": "AI Model Router",
      "category": "AI / LLM",
      "stack": [
        "NestJS",
        "Redis",
        "LangChain",
        "React"
      ],
      "blurb": "Multi-model A/B router with weighted sampling, fallback, and live latency / cost dashboard.",
      "view": "router",
      "accent": "#a855f7"
    },
    {
      "id": "fastapi-rest-demo",
      "name": "FastAPI REST Explorer",
      "category": "Backend",
      "stack": [
        "FastAPI",
        "Python",
        "Pydantic",
        "Pytest"
      ],
      "blurb": "Modular FastAPI REST service with JWT auth, OpenAPI schema viewer, and a live in-browser request tester.",
      "view": "fastapi_explore",
      "accent": "#6d7cff"
    },
    {
      "id": "nestjs-modular-api",
      "name": "NestJS Modular API",
      "category": "Backend",
      "stack": [
        "NestJS",
        "TypeScript",
        "TypeORM",
        "Swagger"
      ],
      "blurb": "NestJS module-architecture explorer: DI graph, DTOs, guards, interceptors - visualized.",
      "view": "nestjs_explore",
      "accent": "#e4438e"
    },
    {
      "id": "go-rate-limiter",
      "name": "Go Token-Bucket Limiter",
      "category": "Backend",
      "stack": [
        "Go",
        "Redis",
        "gRPC",
        "Vite"
      ],
      "blurb": "Token-bucket + sliding-window rate limiter (Go) with live throughput chart.",
      "view": "rate_limiter",
      "accent": "#22d3ee"
    },
    {
      "id": "api-gateway-dashboard",
      "name": "API Gateway Dashboard",
      "category": "Backend / DevOps",
      "stack": [
        "Express",
        "JWT",
        "Redis",
        "React",
        "Prometheus"
      ],
      "blurb": "Unified gateway metrics: routes, latency p50/p95/p99, error rate, top consumers, key rotation.",
      "view": "gateway_metrics",
      "accent": "#6d7cff"
    },
    {
      "id": "celery-worker-monitor",
      "name": "Celery Worker Monitor",
      "category": "Backend",
      "stack": [
        "Celery",
        "Redis",
        "Python",
        "React"
      ],
      "blurb": "Asynchronous worker queue visualizer: queues, retries, ETA, broker stats, dead-letter inspection.",
      "view": "celery_monitor",
      "accent": "#a855f7"
    },
    {
      "id": "websocket-realtime-chat",
      "name": "WebSocket Realtime Chat",
      "category": "Backend / Frontend",
      "stack": [
        "NestJS",
        "WebSocket",
        "Redis",
        "Vite"
      ],
      "blurb": "Realtime chat client + server with presence, typing indicators, and backpressure (broker-published).",
      "view": "ws_chat",
      "accent": "#22d3ee"
    },
    {
      "id": "nextjs-ssr-showcase",
      "name": "Next.js SSR Showcase",
      "category": "Frontend",
      "stack": [
        "Next.js",
        "React",
        "TypeScript"
      ],
      "blurb": "Side-by-side SSR vs SSG vs ISR vs Client rendering with timing bars and caching headers.",
      "view": "nextjs_ssr",
      "accent": "#6d7cff"
    },
    {
      "id": "react-design-system",
      "name": "React Design System",
      "category": "Frontend",
      "stack": [
        "React",
        "Tailwind",
        "TypeScript",
        "Vite"
      ],
      "blurb": "Tailwind + shadcn-style component library showcase with tokens, accessibility notes, and usage.",
      "view": "design_system",
      "accent": "#a855f7"
    },
    {
      "id": "nuxt-rtl-dashboard",
      "name": "Nuxt RTL Dashboard",
      "category": "Frontend",
      "stack": [
        "Nuxt.js",
        "Vue",
        "Tailwind",
        "i18n"
      ],
      "blurb": "Nuxt.js bilingual (FA/EN) RTL dashboard with chart-heavy KPIs and theme switching.",
      "view": "nuxt_dashboard",
      "accent": "#22d3ee"
    },
    {
      "id": "vite-portfolio-theme",
      "name": "Vite Portfolio Theme",
      "category": "Frontend",
      "stack": [
        "Vite",
        "React",
        "GSAP",
        "Tailwind"
      ],
      "blurb": "GSAP-driven premium portfolio template with scroll triggers and a clean editorial layout.",
      "view": "portfolio_theme",
      "accent": "#22d3ee"
    },
    {
      "id": "typescript-data-table",
      "name": "TypeScript Data Table",
      "category": "Frontend",
      "stack": [
        "TypeScript",
        "React",
        "Vite"
      ],
      "blurb": "Virtualized, sortable, filterable, keyboard-navigable data table library.",
      "view": "data_table",
      "accent": "#6d7cff"
    },
    {
      "id": "docker-compose-starter",
      "name": "Docker Compose Starter",
      "category": "DevOps",
      "stack": [
        "Docker",
        "Compose",
        "Nginx",
        "Make"
      ],
      "blurb": "Multi-service compose starter: API + worker + Postgres + Redis + Nginx with Make-driven dev workflow.",
      "view": "compose_starter",
      "accent": "#22d3ee"
    },
    {
      "id": "cloudflare-worker-template",
      "name": "Cloudflare Worker Template",
      "category": "DevOps / Edge",
      "stack": [
        "Cloudflare Workers",
        "KV",
        "TypeScript",
        "wrangler"
      ],
      "blurb": "Workers + KV starter with route handlers, edge caching, and a deployed demo.",
      "view": "worker_template",
      "accent": "#f6821f"
    },
    {
      "id": "github-actions-showcase",
      "name": "GitHub Actions Library",
      "category": "DevOps / CI-CD",
      "stack": [
        "GitHub Actions",
        "YAML",
        "Docker",
        "Matrix"
      ],
      "blurb": "Reusable CI/CD workflow library: build, test, scan, deploy across Node/Python/Go.",
      "view": "actions_lib",
      "accent": "#a855f7"
    },
    {
      "id": "nginx-reverse-proxy-kit",
      "name": "Nginx Reverse Proxy Kit",
      "category": "DevOps",
      "stack": [
        "Nginx",
        "Let's Encrypt",
        "Docker",
        "Bash"
      ],
      "blurb": "Visual Nginx config generator: upstreams, TLS, caching, gzip, rate-limit.",
      "view": "nginx_kit",
      "accent": "#22d3ee"
    },
    {
      "id": "vps-deploy-checklist",
      "name": "VPS Deploy Playbook",
      "category": "DevOps",
      "stack": [
        "Linux",
        "Bash",
        "Docker",
        "UFW"
      ],
      "blurb": "Interactive zero-downtime deploy playbook: provisioning, security baseline, env, secrets, rollback.",
      "view": "vps_playbook",
      "accent": "#6d7cff"
    },
    {
      "id": "xray-config-generator",
      "name": "Xray Config Generator",
      "category": "Network / Security",
      "stack": [
        "Xray",
        "VLESS",
        "Certbot",
        "Go"
      ],
      "blurb": "Generates VLESS/Vmess Xray server+client configs with TLS, fallback, and reality options.",
      "view": "xray_gen",
      "accent": "#22d3ee"
    },
    {
      "id": "jwt-inspector",
      "name": "JWT Inspector",
      "category": "Network / Security",
      "stack": [
        "TypeScript",
        "Crypto",
        "Vite"
      ],
      "blurb": "Decode, inspect, and visualize JWT signatures; HS256/RS256 with claims timeline.",
      "view": "jwt_inspector",
      "accent": "#a855f7"
    },
    {
      "id": "api-key-vault-ui",
      "name": "API Key Vault UI",
      "category": "Security / Backend",
      "stack": [
        "NestJS",
        "TypeORM",
        "React",
        "Postgres"
      ],
      "blurb": "API key management vault: scope matrices, rotation, audit log, masking UI.",
      "view": "key_vault",
      "accent": "#6d7cff"
    }
  ]
};
