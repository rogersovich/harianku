import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "HarianKu - Rencanakan Hari, Hidup Teratur",
  description: "Aplikasi mobile-first untuk mencatat meal plan, stok dapur, dan olahraga harian.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-bg-warm font-sans flex flex-col justify-start">
        <div className="app-container">
          {children}
        </div>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
