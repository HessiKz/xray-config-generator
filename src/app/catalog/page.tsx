"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Btn, Section } from "@/components/ui";

type Product = {
  id: string;
  title: string;
  slug: string;
  unit: string;
  section: string | null;
  aliases: { id: string; sourceText: string; side: string }[];
};

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("/api/catalog");
    const data = await res.json();
    if (res.ok) {
      setProducts(data.products || []);
      if (!productId && data.products?.[0]) setProductId(data.products[0].id);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onAdd(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, sourceText, side: "both" }),
    });
    if (!res.ok) {
      setMsg("افزودن alias ناموفق");
      return;
    }
    setMsg("alias ذخیره شد");
    setSourceText("");
    await load();
  }

  return (
    <AppShell
      title="کاتالوگ کالا و Alias"
      subtitle="کله کامل / سیراب تکی و سایر نام‌های انعکاس را اینجا نگاشت کنید"
    >
      {msg ? <p className="mb-4 text-sm text-[var(--accent)]">{msg}</p> : null}
      <Section title="افزودن نام معادل انعکاس">
        <form onSubmit={onAdd} className="grid gap-3 sm:grid-cols-2">
          <select
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <input
            className="rounded-md border border-[var(--line)] bg-black/20 px-3 py-2 text-sm"
            placeholder="متن ثبت‌شده در انعکاس"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            required
          />
          <Btn>افزودن alias</Btn>
        </form>
      </Section>
      <Section title="کالاهای canonical">
        <div className="space-y-5">
          {products.map((p) => (
            <div key={p.id} className="border-t border-[var(--line)] pt-3 text-sm">
              <p className="font-medium">
                {p.title}{" "}
                <span className="text-[var(--muted)]">
                  ({p.unit} / {p.section})
                </span>
              </p>
              <ul className="mt-2 space-y-1 text-[var(--muted)]">
                {p.aliases.map((a) => (
                  <li key={a.id}>• {a.sourceText}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </AppShell>
  );
}
