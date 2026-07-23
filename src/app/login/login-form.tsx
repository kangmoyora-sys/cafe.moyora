"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: String(form.get("email")), password: String(form.get("password")),
      });
      if (signInError) { setError("이메일 또는 비밀번호를 확인해 주세요."); return; }
      router.replace("/dashboard"); router.refresh();
    } catch {
      setError("로그인 설정을 확인할 수 없습니다. 관리자에게 문의해 주세요.");
    } finally { setLoading(false); }
  }

  return <form onSubmit={handleSubmit} className="space-y-5">
    <label className="block text-sm font-medium">이메일<input required name="email" type="email" autoComplete="email" className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-emerald-600" /></label>
    <label className="block text-sm font-medium">비밀번호<input required name="password" type="password" autoComplete="current-password" className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none focus:border-emerald-600" /></label>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={loading} className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-60">{loading ? "로그인 중…" : "로그인"}</button>
  </form>;
}
