"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { Toaster } from "react-hot-toast";
import { config } from "@/lib/wagmi";
import { Header } from "@/components/ui";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "#1a1a24",
                    color: "#e8e8f0",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                  },
                  success: {
                    iconTheme: {
                      primary: "#10b981",
                      secondary: "#1a1a24",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#1a1a24",
                    },
                  },
                }}
              />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
