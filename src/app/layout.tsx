import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "HarianKu - Rencanakan Hari, Hidup Teratur 🥗🏃‍♂️",
  description: "Kelola rencana menu masak mingguan, pantau stok dapur secara otomatis, dan jadwalkan olahraga harian dengan mudah dan menyenangkan.",
  metadataBase: new URL("https://harianku.dimasroger.my.id"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "HarianKu - Rencanakan Hari, Hidup Teratur 🥗🏃‍♂️",
    description: "Kelola rencana menu masak mingguan, pantau stok dapur secara otomatis, dan jadwalkan olahraga harian dengan mudah dan menyenangkan.",
    url: "https://harianku.dimasroger.my.id",
    siteName: "HarianKu",
    images: [
      {
        url: "/harianku-og-image-real.png",
        width: 1200,
        height: 630,
        alt: "HarianKu Preview",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HarianKu - Rencanakan Hari, Hidup Teratur 🥗🏃‍♂️",
    description: "Kelola rencana menu masak mingguan, pantau stok dapur secara otomatis, dan jadwalkan olahraga harian dengan mudah dan menyenangkan.",
    images: ["/harianku-og-image-real.png"],
  },
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
