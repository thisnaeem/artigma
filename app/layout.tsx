import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";

const figtree = Figtree({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-figtree',
});

export const metadata: Metadata = {
  title: "AI Image Generator",
  description: "Generate and manage AI images",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={figtree.variable}>
      <body className={`${figtree.className} min-h-screen bg-[#f8f8f8] dark:bg-[#121212]`}>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0e0e010_1px,transparent_1px),linear-gradient(to_bottom,#e0e0e010_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
