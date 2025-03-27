import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tree of Life",
  description: "Interactive Kabbalah Tree of Life visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn("h-screen w-screen bg-background text-foreground")}>
        {children}
      </body>
    </html>
  );
}
