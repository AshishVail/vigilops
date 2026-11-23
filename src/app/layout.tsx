import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/components/providers/app-provider";
import { Toaster } from "@/components/ui/toaster";
import { ToasterProvider } from "@/components/ui/toaster";

export const metadata: Metadata = {
  metadataBase: new URL("https://vigilops.nexovent.tech"),
  title: { default: "VigilOps", template: "%s | VigilOps" },
  description: "Monitor. Test. Secure. Resolve.",
  icons: { icon: "/favicon.svg", apple: "/icon-192.png" },
  openGraph: {
    title: "VigilOps",
    description: "Monitor. Test. Secure. Resolve.",
    url: "https://vigilops.nexovent.tech",
    siteName: "VigilOps",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#07090D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        <AppProvider>
          <ToasterProvider>
            {children}
            <Toaster />
          </ToasterProvider>
        </AppProvider>
      </body>
    </html>
  );
}
