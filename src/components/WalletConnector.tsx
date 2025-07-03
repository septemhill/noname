"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { tokens } from "@/lib/constants";
import { CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { TokenBalance } from "@/components/TokenBalance";

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

export function WalletConnector() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground">
            {address!.slice(0, 6)}...{address!.slice(-4)}
          </button>
        </DialogTrigger>
        <button onClick={() => disconnect()} className="ml-2 rounded-md bg-destructive px-4 py-2 text-destructive-foreground">
          Disconnect
        </button>
        <AccountModal address={address!} />
      </Dialog>
    );
  }

  return (
    <button onClick={() => connect({ connector: injected() })} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
      Connect Wallet
    </button>
  );
}
