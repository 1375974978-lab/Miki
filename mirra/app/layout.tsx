import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "MIRRA｜美妆与消费品智能对比",
  description:
    "粘贴两个商品链接，用公开网络信息完成价格、成分、功效与口碑的多维对比。",
  applicationName: "MIRRA",
  keywords: ["美妆对比", "护肤品对比", "消费品对比", "AI 商品研究"],
  openGraph: {
    title: "MIRRA｜把两支产品放在同一面镜子里",
    description:
      "价格、成分、功效与公开口碑，一次看清真正影响选择的差异。",
    type: "website",
    locale: "zh_CN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f6f3",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
