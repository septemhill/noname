"use client";

import { WalletConnector } from "./WalletConnector";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="font-bold">Chain Explorer</div>
        <div className="flex items-center gap-4">
          <WalletConnector />
        </div>
      </div>
    </header>
  );
}
