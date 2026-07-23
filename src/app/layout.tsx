import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "모여라 카페 콘텐츠센터 | Moyora Cafe Studio",
  description: "모여라 내부용 네이버 카페 콘텐츠 관리 서비스",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
