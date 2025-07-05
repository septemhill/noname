"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { tokens } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { TokenBalance } from "@/components/TokenBalance";

function AccountModal({ address, disconnect }: { address: `0x${string}`; disconnect: () => void }) {
  return (
    <DialogContent className="w-[800px]">
      <DialogHeader>
        <DialogTitle>Token Balances</DialogTitle>
      </DialogHeader>
      <CardContent>
        <ul>
          {tokens.map((token) => (
            <TokenBalance key={token.address} address={address} token={token} />
          ))}
        </ul>
        <Button onClick={disconnect} className="mt-4 w-full" variant="destructive">
          Disconnect
        </Button>
      </CardContent>
    </DialogContent>
  );
}

export function WalletConnector() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // 這確保組件只在客戶端渲染，防止水合作用（hydration）不匹配的問題。
    setIsClient(true);
  }, []);

  if (!isClient) {
    // 在伺服器端不渲染任何內容，或者顯示一個佔位符
    return null;
  }

  if (isConnected) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">
            {address!.slice(0, 6)}...{address!.slice(-4)}
          </Button>
        </DialogTrigger>
        <AccountModal address={address!} disconnect={disconnect} />
      </Dialog>
    );
  }

  const handleConnect = (connector: any) => {
    connect({ connector });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Connect Wallet</Button>
      </DialogTrigger>
      <DialogContent className="w-auto">
        <DialogHeader>
          <DialogTitle>Choose a wallet</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-2">
          {connectors.map((connector) => (
            <DialogClose key={connector.uid} asChild>
              <Button
                className="flex items-center justify-start space-x-4 text-left"
                onClick={() => handleConnect(connector)}
              >
                {connector.icon && (
                  <img
                    src={connector.icon}
                    alt={connector.name}
                    className="h-6 w-6 rounded-md"
                  />
                )}
                <span>{connector.name}</span>
              </Button>
            </DialogClose>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}