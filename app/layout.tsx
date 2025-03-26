import "./globals.css";

import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Youtube Clone",
  description: "Youtube Clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${roboto.variable} antialiased dark`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
