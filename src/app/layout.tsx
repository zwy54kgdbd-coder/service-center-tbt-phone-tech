import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "SERVICE CENTER TBT PHONE TECH - Reparation mobile a Sin-le-Noble",
  description:
    "SERVICE CENTER TBT PHONE TECH au centre commercial Auchan de Sin-le-Noble: reparation mobile, tablette, ordinateur, console de jeux, accessoires, conseil et vente.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  appleWebApp: {
    capable: true,
    title: "SERVICE CENTER",
    statusBarStyle: "black-translucent"
  },
  openGraph: {
    title: "SERVICE CENTER TBT PHONE TECH",
    description: "Reparation mobile, tablette, ordinateur, console de jeux et accessoires a Sin-le-Noble.",
    images: ["/images/logo-magasin.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
