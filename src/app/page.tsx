"use client";

import TokenSupplyCard from "@/components/TokenSupplyCard";
import { mainnet, optimism } from "viem/chains";
import { Header } from "@/components/Header";
import { TransferComponent } from "@/components/TransferComponent";

export default function Home() {
  const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const ethwbtcAddress = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
  const opusdcAddress = "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85"

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pt-16">
        <div className="py-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <TokenSupplyCard tokenAddress={wethAddress} chain={mainnet} />
            <TokenSupplyCard tokenAddress={ethwbtcAddress} chain={mainnet} />
            <TokenSupplyCard tokenAddress={opusdcAddress} chain={optimism} />
          </div>
          <TransferComponent />
        </div>
      </main>
    </div>
  );
}
