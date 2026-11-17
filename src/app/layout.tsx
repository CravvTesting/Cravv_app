import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorker } from "@/proto/ServiceWorker";

export const metadata: Metadata = {
  title: "Tara",
  description: "Tara watches the stove while you cook.",
  applicationName: "Tara",
  appleWebApp: { capable: true, title: "Tara", statusBarStyle: "black-translucent" },
  // Next only emits the generic `mobile-web-app-capable`; iOS still needs the apple- one for the
  // black-translucent status bar (content running under the clock and battery).
  other: { "apple-mobile-web-app-capable": "yes" },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1c1f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="cravv-bg">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
