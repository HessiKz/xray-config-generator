/* ============================================================================
   HessiKz portfolio - themed layout builder.
   Applies a unique design identity per project, then runs window.VIEW().
   Author: Hesam Kazemi (@HessiKz)
   ========================================================================== */
(function () {
  function applyDesign(d) {
    const root = document.documentElement;
    root.style.setProperty("--accent", d.accent);
    root.style.setProperty("--accent-rgb", d.rgb);
    // contrasting ink color for primary buttons
    root.style.setProperty("--accent-ink", d.light ? "#ffffff" : "#06121f");
    root.style.setProperty("--font", '"' + d.font + '", system-ui, sans-serif');
    root.style.setProperty("--mono", '"' + d.fontMono + '", ui-monospace, monospace');
    root.style.setProperty("--radius", (d.radius || 16) + "px");
    root.style.setProperty("--radius-sm", Math.max(8, (d.radius || 16) - 6) + "px");
    root.setAttribute("data-light", d.light ? "true" : "false");
    document.body.style.fontFamily = 'var(--font)';
    // load the chosen fonts
    const fam = d.font.replace(" ", "+") + ":" + (d.light ? "wght@400;500;600;700" : "wght@400;500;600;700;800");
    const mono = d.fontMono.replace(" ", "+") + ":wght@400;500;700";
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" + fam + "&family=" + mono + "&display=swap";
    document.head.appendChild(link);
  }

  function bgLayer(kind) {
    const div = E.h("div", { class: "bg-layer bg-" + kind });
    return div;
  }

  function buildShell(meta) {
    const A = window.MANIFEST.author;
    const d = (window.DESIGNS && window.DESIGNS[meta.id]) || {
      accent: "#6d7cff", rgb: "109,124,255", font: "Space Grotesk", fontMono: "JetBrains Mono", hero: "center", bg: "mesh", radius: 16, seed: "abstract"
    };
    applyDesign(d);

    const root = document.getElementById("app");
    const main = E.h("main", { id: "main" });

    const nav = E.h("nav", { class: "nav" },
      E.h("a", { class: "brand", href: "index.html", "aria-label": "HessiKz home" },
        E.h("div", { class: "logo" }, "H"),
        E.h("div", {}, "HessiKz", E.h("small", {}, " / " + meta.name))
      ),
      E.h("div", { class: "nav-links" },
        E.h("a", { href: "#overview" }, "Overview"),
        E.h("a", { href: "#demo" }, "Demo"),
        E.h("a", { href: "#stack" }, "Stack"),
        E.h("a", { href: "#run" }, "Run")
      ),
      E.h("div", { class: "nav-actions" },
        E.h("a", { class: "btn ghost", href: "https://github.com/" + A.github + "/" + meta.id, target: "_blank", rel: "noopener" }, "Star"),
        E.h("a", { class: "btn primary", href: "https://github.com/" + A.github + "/" + meta.id, target: "_blank", rel: "noopener" }, "Source")
      )
    );
    const skip = E.h("a", { class: "skip-link", href: "#main" }, "Skip to content");

    // Hero variants
    const heroMedia = E.h("div", { class: "hero-media" },
      E.img(d.seed + "-wide", 900, 640, { alt: "" }),
      E.h("div", { class: "scrim" })
    );
    const heroInner = E.h("div", {},
      E.h("div", { class: "pill" }, E.h("span", { class: "dot" }), meta.category + " · by " + A.name),
      E.h("h1", {}, "Build ", E.h("span", { class: "grad-text" }, meta.name), "."),
      E.h("p", { class: "lead" }, meta.blurb),
      E.h("div", { class: "hero-cta" },
        E.h("a", { class: "btn primary", href: "#demo" }, "Try the live demo"),
        E.h("a", { class: "btn", href: "https://github.com/" + A.github + "/" + meta.id, target: "_blank", rel: "noopener" }, "View on GitHub")
      ),
      E.h("div", { class: "tags" }, ...meta.stack.map(s => E.h("span", { class: "tag accent" }, s)))
    );
    let hero;
    if (d.hero === "split" || d.hero === "asym") {
      hero = E.h("header", { class: "hero " + d.hero + " wrap" }, heroInner, heroMedia);
    } else if (d.hero === "editorial") {
      hero = E.h("header", { class: "hero editorial wrap" }, heroInner);
    } else {
      hero = E.h("header", { class: "hero center wrap" }, heroInner);
    }

    const overview = E.h("section", { id: "overview", class: "wrap reveal" },
      E.h("div", { class: "eyebrow" }, "Overview"),
      E.h("h2", {}, "What it does"),
      E.h("p", { class: "lead" }, meta.blurb)
    );
    const demo = E.h("section", { id: "demo", class: "wrap reveal" },
      E.h("div", { class: "eyebrow" }, "Interactive demo"),
      E.h("h2", {}, "See it in action"),
      E.h("div", { id: "view" })
    );
    const stack = E.h("section", { id: "stack", class: "wrap reveal" },
      E.h("div", { class: "eyebrow" }, "Tech stack"),
      E.h("h2", {}, "Built with"),
      E.h("div", { class: "tags", style: "margin-top:8px" }, ...meta.stack.map(s => E.h("span", { class: "tag" }, s)))
    );
    const run = E.h("section", { id: "run", class: "wrap reveal" },
      E.h("div", { class: "eyebrow" }, "Run locally"),
      E.h("h2", {}, "Quick start"),
      E.h("pre", { class: "code", id: "runblock" })
    );

    const footer = E.h("footer", { class: "footer" },
      E.h("div", { class: "wrap" },
        E.h("div", { class: "flex between", style: "flex-wrap:wrap;gap:16px" },
          E.h("div", {},
            E.h("div", { class: "brand" }, E.h("div", { class: "logo" }, "H"), E.h("div", {}, "HessiKz")),
            E.h("p", { class: "muted", style: "margin:10px 0 0;max-width:340px;font-size:14px" },
              "Crafted by " + A.name + ", " + A.role + ". Part of a 25-project portfolio demonstrating full-stack, AI, and DevOps engineering.")
          ),
          E.h("div", { class: "flex", style: "gap:18px;flex-wrap:wrap" },
            E.h("a", { href: "https://github.com/" + A.github, target: "_blank", rel: "noopener" }, "GitHub"),
            E.h("a", { href: A.resume_url, target: "_blank", rel: "noopener" }, "Resume"),
            E.h("a", { href: "https://github.com/" + A.github + "/" + meta.id, target: "_blank", rel: "noopener" }, "Source")
          )
        ),
        E.h("p", { class: "faint", style: "margin-top:24px;font-size:13px" },
          "© " + new Date().getFullYear() + " " + A.name + " · MIT licensed · github.com/" + A.github)
      )
    );

    [skip, nav, hero, main].forEach(n => root.appendChild(n));
    main.appendChild(overview); main.appendChild(demo); main.appendChild(stack); main.appendChild(run); main.appendChild(footer);
    root.appendChild(bgLayer(d.bg));

    const rb = E.el("#runblock");
    const runLines = [
      "# Clone the repository",
      "git clone https://github.com/" + A.github + "/" + meta.id + ".git",
      "cd " + meta.id,
      "",
      "# Install dependencies and run the demo",
      "npm install && npm run dev",
      "",
      "# Open the local preview",
      "echo \"Ready at http://localhost:5173\""
    ];
    rb.innerHTML = E.highlight(runLines.join("\n")).replace(/\n/g, "<br>");

    if (typeof window.VIEW === "function") window.VIEW(E.el("#view"), meta, A, d);
    document.documentElement.classList.add("js-reveal");
    E.reveal();
  }

  window.buildShell = buildShell;
})();
