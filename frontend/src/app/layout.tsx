import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import ThemeProvider from "@/context/theme-context";
import Navbar from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FIslab II | Home",
  description: "Web Fisika Laboratory II",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
          <ThemeProvider 
              attribute={'class'}
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              >
                  <div className="min-h-[calc(100vh-4rem)]">
                    <Navbar/>
                    <main className="flex flex-row">
                       {children}
                    </main>
                  </div>
          </ThemeProvider>
        </body>
      </html>
      
  );
}
