"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { injected } from "wagmi/connectors";
import { mainnet, optimism } from "wagmi/chains";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const tokens = [
  { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", chainId: mainnet.id, name: "WETH" },
  { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", chainId: mainnet.id, name: "WBTC" },
  { address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", chainId: optimism.id, name: "USDC" },
];

function AccountModal({ address }: { address: `0x${string}` }) {
  return (
    <DialogContent className="w-[400px]">
      <DialogHeader>
        <DialogTitle>Token Balances</DialogTitle>
      </DialogHeader>
      <CardContent>
        <ul>
          {tokens.map((token) => (
            <TokenBalance key={token.address} address={address} token={token} />
          ))}
        </ul>
      </CardContent>
    </DialogContent>
  );
} 


function TokenBalance({ address, token }: { address: `0x${string}`; token: typeof tokens[0] }) {
  const { data, isLoading, error } = useBalance({
    address,
    token: token.address,
    chainId: token.chainId,
  });

  return (
    <li className="flex justify-between py-2 border-b">
      <span>{token.name}</span>
      <span>
        {isLoading && "Loading..."}
        {error && "Error"}
        {data && `${parseFloat(data.formatted).toFixed(4)} ${data.symbol}`}
      </span>
    </li>
  );
}

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground">
            {address.slice(0, 6)}...{address.slice(-4)}
          </button>
        </DialogTrigger>
        <button onClick={() => disconnect()} className="ml-2 rounded-md bg-destructive px-4 py-2 text-destructive-foreground">
          Disconnect
        </button>
        <AccountModal address={address} />
      </Dialog>
    );
  }

  return (
    <button onClick={() => connect({ connector: injected() })} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
      Connect Wallet
    </button>
  );
}
