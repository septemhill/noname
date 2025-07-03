"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { mainnet, optimism, sepolia } from "wagmi/chains";
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

const allChains = [mainnet, optimism, sepolia];

function AccountModal({ address, disconnect }: { address: `0x${string}`; disconnect: () => void }) {
  const { chain } = useAccount();

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
        <button onClick={disconnect} className="mt-4 w-full rounded-md bg-destructive py-2 text-destructive-foreground">
          Disconnect
        </button>
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
        <AccountModal address={address!} disconnect={disconnect} />
      </Dialog>
    );
  }

  return (
    <button onClick={() => connect({ connector: injected() })} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
      Connect Wallet
    </button>
  );
}
