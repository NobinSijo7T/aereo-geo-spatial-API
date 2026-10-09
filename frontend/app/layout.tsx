import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Geospatial Measurement Studio",
  description: "Upload geospatial files and inspect verified measurements.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

