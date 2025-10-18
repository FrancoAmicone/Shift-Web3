import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shift Token Web3 - ERC20 Token DApp",
  description: "Interactúa con el token SHIFT en Sepolia Testnet. Conecta tu wallet, consulta balance, reclama tokens del faucet y transfiere a otras direcciones.",
  keywords: ["Web3", "ERC20", "Token", "Ethereum", "Sepolia", "DApp", "MetaMask", "Blockchain"],
  authors: [{ name: "Shift Token Web3" }],
  openGraph: {
    title: "Shift Token Web3 - ERC20 Token DApp",
    description: "Interactúa con el token SHIFT en Sepolia Testnet",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shift Token Web3 - ERC20 Token DApp",
    description: "Interactúa con el token SHIFT en Sepolia Testnet",
  },
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
        {children}
      </body>
    </html>
  );
}
