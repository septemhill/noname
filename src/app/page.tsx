"use client";

import TokenSupplyCard from "@/components/TokenSupplyCard";
import { mainnet, optimism } from "viem/chains";
import { TransferForm } from "@/components/TransferForm";
import { SwapForm } from "@/components/SwapForm";
import { allChains, tokens } from "@/lib/constants";
import { P2PExchangeClient } from "@/components/P2PExchangeClient";

export default function Home() {
  const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const ethwbtcAddress = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
  const opusdcAddress = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85"

    const serializableChains = allChains.map(chain => ({
      id: chain.id,
      name: chain.name,
    }));
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <main className="flex-1 pt-16 pl-16 pr-16">
        <div className="py-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <TokenSupplyCard tokenAddress={wethAddress} chain={mainnet} />
            <TokenSupplyCard tokenAddress={ethwbtcAddress} chain={mainnet} />
            <TokenSupplyCard tokenAddress={opusdcAddress} chain={optimism} />
          </div>
        </div>

        {/* <TransferForm /> */}
        {/* <SwapForm chains={serializableChains} tokens={tokens} /> */}

        <div className="mt-8">
          <P2PExchangeClient />
        </div>
      </main>
    </div>
  );
}
