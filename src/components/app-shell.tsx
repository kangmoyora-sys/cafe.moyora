import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

type AppShellProps = { children: React.ReactNode; email: string; title: string; description?: string };

export function AppShell({ children, email, title, description }: AppShellProps) {
  return (
    <main className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="font-bold text-stone-900">모여라 카페 콘텐츠센터</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-stone-500">{email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <nav className="mb-8 flex flex-wrap gap-2 text-sm text-stone-600">
          <Link className="rounded-md px-3 py-2 hover:bg-stone-200" href="/dashboard">대시보드</Link>
          <Link className="rounded-md px-3 py-2 hover:bg-stone-200" href="/content">내 초안</Link>
          <Link className="rounded-md px-3 py-2 hover:bg-stone-200" href="/content/new">새 콘텐츠</Link>
          <Link className="rounded-md px-3 py-2 hover:bg-stone-200" href="/settings/naver">네이버 연결</Link>
          <Link className="rounded-md px-3 py-2 hover:bg-stone-200" href="/admin">관리자</Link>
        </nav>
        <section className="mb-8"><h1 className="text-3xl font-bold tracking-tight">{title}</h1>{description && <p className="mt-2 text-stone-600">{description}</p>}</section>
        {children}
      </div>
    </main>
  );
}
