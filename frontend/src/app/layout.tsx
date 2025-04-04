import type { Metadata } from "next";
import "../styles/globals.css";
import ThemeProvider from "@/context/theme-context";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/toaster";


export const metadata: Metadata = {
  title: "Fislab | Home",
  description: "Physics Laboratory Web Introduction",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <html lang="en" className="scroll-smooth">
      <head> 
      <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </head>
        <body
          className={` antialiased `}
          >
          <ThemeProvider 
              attribute={'class'}
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              >
                  <div className="min-h-[calc(100vh-4rem)]">
                    <Toaster/>
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
