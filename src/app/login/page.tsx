import { LoginForm } from "./login-form";

export default function LoginPage() {
  return <main className="grid min-h-screen place-items-center bg-stone-100 px-6"><section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
    <p className="text-sm font-semibold text-emerald-700">Moyora Cafe Studio</p><h1 className="mt-2 text-2xl font-bold">모여라 카페 콘텐츠센터</h1><p className="mt-2 mb-8 text-sm text-stone-600">내부 직원 전용 서비스입니다.</p><LoginForm />
  </section></main>;
}
