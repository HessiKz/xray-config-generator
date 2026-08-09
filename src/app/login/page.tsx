import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-16">
          <p className="text-[var(--muted)]">بارگذاری…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
