"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, bsc, optimism, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const config = createConfig({
  chains: [mainnet, bsc, optimism, sepolia],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [optimism.id]: http(),
    [sepolia.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
