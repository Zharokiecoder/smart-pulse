import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "FoodRescue — From Surplus to Sustenance",
  description: "Connect food donors with NGOs and food banks to rescue surplus food and feed communities.",
  keywords: "food rescue, food donation, NGO, food bank, surplus food, zero waste",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
