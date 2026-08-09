/**
 * Read-only Enekas Mali client (session + Sgrid).
 * Never writes documents to Enekas.
 */

type CookieJar = Map<string, string>;

export class EnekasClient {
  private base: string;
  private username: string;
  private password: string;
  private cookies: CookieJar = new Map();
  private csrf = "";
  private timeoutMs: number;

  constructor(opts?: {
    base?: string;
    username?: string;
    password?: string;
    timeoutMs?: number;
  }) {
    this.base = (opts?.base || process.env.ENEKAS_BASE_URL || "").replace(
      /\/$/,
      "",
    );
    this.username = opts?.username || process.env.ENEKAS_USERNAME || "";
    this.password = opts?.password || process.env.ENEKAS_PASSWORD || "";
    this.timeoutMs = opts?.timeoutMs ?? 60_000;
    if (!this.base || !this.username || !this.password) {
      throw new Error("Enekas credentials/base URL missing");
    }
  }

  private cookieHeader() {
    return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  private absorbSetCookie(res: Response) {
    const raw = res.headers.getSetCookie?.() || [];
    for (const line of raw) {
      const [pair] = line.split(";");
      const eq = pair.indexOf("=");
      if (eq > 0) {
        const name = pair.slice(0, eq).trim();
        const value = pair.slice(eq + 1).trim();
        if (value === "deleted") this.cookies.delete(name);
        else this.cookies.set(name, value);
      }
    }
    const single = res.headers.get("set-cookie");
    if (single && raw.length === 0) {
      for (const part of single.split(/,(?=[^;]+?=)/)) {
        const [pair] = part.split(";");
        const eq = pair.indexOf("=");
        if (eq > 0) {
          this.cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
        }
      }
    }
  }

  private async request(path: string, init: RequestInit = {}, attempt = 0): Promise<Response> {
    const headers = new Headers(init.headers || {});
    headers.set(
      "User-Agent",
      "Mozilla/5.0 (compatible; FarimanOps/1.0; +read-only)",
    );
    if (this.cookies.size) headers.set("Cookie", this.cookieHeader());
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.base}${path}`, {
        ...init,
        headers,
        redirect: "manual",
        signal: controller.signal,
      });
      this.absorbSetCookie(res);
      return res;
    } catch (err) {
      if (attempt < 3) {
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        return this.request(path, init, attempt + 1);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  async login() {
    const loginPage = await this.request("/core/app/login?continue=L2FjYy8=");
    await loginPage.text();
    const csrf = this.cookies.get("csrfToken");
    if (!csrf) throw new Error("csrfToken missing from login page");
    this.csrf = csrf;

    const body = new URLSearchParams({
      csrfToken: csrf,
      "LoginForm[username]": this.username,
      "LoginForm[password]": this.password,
    });

    const res = await this.request("/core/app/login?continue=L2FjYy8=", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Origin: this.base,
        Referer: `${this.base}/core/app/login?continue=L2FjYy8=`,
      },
      body,
    });

    if (res.status !== 302 && res.status !== 200) {
      throw new Error(`Enekas login failed HTTP ${res.status}`);
    }

    const home = await this.request("/acc/");
    const html = await home.text();
    if (html.includes("login-form")) {
      throw new Error("Enekas login rejected (still on login form)");
    }
    const m = html.match(/window\['csrfToken'\]\s*=\s*"([^"]+)"/);
    if (m) this.csrf = m[1];
    return { ok: true as const };
  }

  async sgrid(
    path: string,
    rows = 500,
    page = 1,
    opts?: { sidx?: string; sord?: "asc" | "desc" },
  ) {
    if (!this.csrf && this.cookies.get("csrfToken")) {
      this.csrf = this.cookies.get("csrfToken")!;
    }
    const body = new URLSearchParams({
      csrfToken: this.csrf || this.cookies.get("csrfToken") || "",
      page: String(page),
      rows: String(rows),
      sidx: opts?.sidx || "",
      sord: opts?.sord || "asc",
    });
    const res = await this.request(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json, text/javascript, */*; q=0.01",
        Referer: `${this.base}/acc/`,
      },
      body,
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`Sgrid ${path} HTTP ${res.status}`);
    try {
      return JSON.parse(text) as {
        records?: string | number;
        rows?: Record<string, unknown>[] | null;
        page?: string | number;
      };
    } catch {
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      const out: Record<string, unknown>[] = [];
      for (const line of lines) {
        if (line.startsWith('{"page"')) continue;
        try {
          out.push(JSON.parse(line.replace(/,$/, "")));
        } catch {
          /* skip */
        }
      }
      return { records: out.length, rows: out };
    }
  }
}

export function isReadOnlyGuard() {
  return true;
}
