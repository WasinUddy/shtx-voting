import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHTX Voting",
  description: "Live audience voting",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full min-h-full flex flex-col">{children}</body>
    </html>
  );
}
