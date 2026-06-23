import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "SERVICE CENTER TBT PHONE TECH - Reparation mobile a Sin-le-Noble",
  description:
    "SERVICE CENTER TBT PHONE TECH, service center smartphone au centre commercial Auchan de Sin-le-Noble: reparation mobile, accessoires, conseil et vente.",
  openGraph: {
    title: "SERVICE CENTER TBT PHONE TECH",
    description: "Reparation, accessoires et services smartphone a Sin-le-Noble.",
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
