import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'antd/dist/reset.css'; // Import Ant Design CSS
import { StoreProvider } from "@/store/store-provider";
import CSPProvider from "./components/csp-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Perindo",
  description: "Perindo Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Meta tags untuk CSP */}
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      </head>
      <body className={inter.className}>
        <CSPProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </CSPProvider>
      </body>
    </html>
  );
}
