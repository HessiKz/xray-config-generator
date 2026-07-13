/* Shared layout builder. Produces nav, hero, and footer consistently
   and wires the per-project VIEW() defined in app.js.
   Author: Hesam Kazemi (@HessiKz) */
(function () {
  function buildShell(meta) {
    const root = document.getElementById("app");
    const A = window.MANIFEST.author;

    const nav = E.h("nav", { class: "nav" },
      E.h("a", { class: "brand", href: "index.html" },
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
        E.h("a", { class: "btn ghost", href: "https://github.com/" + A.github + "/" + meta.id, target: "_blank" }, "★ Star"),
        E.h("a", { class: "btn primary", href: "https://github.com/" + A.github + "/" + meta.id, target: "_blank" }, "Source")
      )
    );

    const hero = E.h("header", { class: "hero wrap" },
      E.h("div", { class: "pill" }, E.h("span", { class: "dot" }), meta.category + " · by Hesam Kazemi"),
      E.h("h1", {}, "Build ", E.h("span", { class: "grad-text" }, meta.name), "."),
      E.h("p", { class: "lead" }, meta.blurb),
      E.h("div", { class: "hero-cta" },
        E.h("a", { class: "btn primary", href: "#demo" }, "▶ Try the live demo"),
        E.h("a", { class: "btn", href: "https://github.com/" + A.github + "/" + meta.id, target: "_blank" }, "View on GitHub")
      ),
      E.h("div", { class: "tags" }, ...meta.stack.map(s => E.h("span", { class: "tag accent" }, s)))
    );

    const overview = E.h("section", { id: "overview", class: "wrap fade-in" },
      E.h("div", { class: "eyebrow" }, "Overview"),
      E.h("h2", {}, "What it does"),
      E.h("p", { class: "lead" }, meta.blurb)
    );

    const demo = E.h("section", { id: "demo", class: "wrap fade-in" },
      E.h("div", { class: "eyebrow" }, "Interactive Demo"),
      E.h("h2", {}, "See it in action"),
      E.h("div", { id: "view" })
    );

    const stack = E.h("section", { id: "stack", class: "wrap fade-in" },
      E.h("div", { class: "eyebrow" }, "Tech Stack"),
      E.h("h2", {}, "Built with"),
      E.h("div", { class: "tags", style: "margin-top:8px" }, ...meta.stack.map(s => E.h("span", { class: "tag" }, s)))
    );

    const run = E.h("section", { id: "run", class: "wrap fade-in" },
      E.h("div", { class: "eyebrow" }, "Run Locally"),
      E.h("h2", {}, "Quick start"),
      E.h("pre", { class: "code", id: "runblock" })
    );

    const footer = E.h("footer", { class: "footer" },
      E.h("div", { class: "wrap" },
        E.h("div", { class: "flex between", style: "flex-wrap:wrap;gap:16px" },
          E.h("div", {},
            E.h("div", { class: "brand" }, E.h("div", { class: "logo" }, "H"), E.h("div", {}, "HessiKz")),
            E.h("p", { class: "muted", style: "margin:10px 0 0;max-width:340px;font-size:14px" },
              "Crafted by " + A.name + ", " + A.role + ". This project is part of a 25-project portfolio built to showcase full-stack, AI, and DevOps engineering.")
          ),
          E.h("div", { class: "flex", style: "gap:18px;flex-wrap:wrap" },
            E.h("a", { href: "https://github.com/" + A.github, target: "_blank" }, "GitHub"),
            E.h("a", { href: A.resume_url, target: "_blank" }, "Resume"),
            E.h("a", { href: "https://github.com/" + A.github + "/" + meta.id, target: "_blank" }, "Source")
          )
        ),
        E.h("p", { class: "faint", style: "margin-top:24px;font-size:13px" },
          "© " + new Date().getFullYear() + " " + A.name + " · Licensed under MIT · https://github.com/" + A.github)
      )
    );

    [nav, hero, overview, demo, stack, run, footer].forEach(n => root.appendChild(n));

    // run block content
    const rb = E.el("#runblock");
    const runLines = [
      "# Clone",
      "git clone https://github.com/" + A.github + "/" + meta.id + ".git",
      "cd " + meta.id,
      "",
      "# Install & run (see README for your stack)",
      "npm install && npm run dev",
      "",
      "# Open http://localhost:5173"
    ];
    rb.innerHTML = E.highlight(runLines.join("\n")).replace(/\n/g, "<br>");

    // fire project-specific view
    if (typeof window.VIEW === "function") window.VIEW(E.el("#view"), meta, A);
    E.reveal();
  }

  window.buildShell = buildShell;
})();
