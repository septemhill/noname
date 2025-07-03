"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Selector } from "./Selector"; // Import the new Selector component

// Mock data for chains and tokens
const chains = [
  { value: "ethereum", label: "Ethereum" },
  { value: "binance-smart-chain", label: "Binance Smart Chain" },
  { value: "polygon", label: "Polygon" },
];

const tokensByChain: { [key: string]: { value: string; label: string }[] } = {
  ethereum: [
    { value: "eth", label: "Ether" },
    { value: "usdt", label: "Tether" },
    { value: "dai", label: "Dai" },
  ],
  "binance-smart-chain": [
    { value: "bnb", label: "BNB" },
    { value: "busd", label: "Binance USD" },
  ],
  polygon: [
    { value: "matic", label: "Matic" },
    { value: "usdc", label: "USD Coin" },
  ],
};

export function TransferComponent() {
  const [selectedChain, setSelectedChain] = React.useState<string>("");
  const [availableTokens, setAvailableTokens] = React.useState<{ value: string; label: string }[]>([]);
  const [selectedToken, setSelectedToken] = React.useState<string>("");
  const [recipientAddress, setRecipientAddress] = React.useState<string>("");

  const handleChainChange = (chainId: string) => {
    setSelectedChain(chainId);
    setSelectedToken(""); // Reset token selection when chain changes
    setAvailableTokens(tokensByChain[chainId] || []);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transfer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="chain-select">Chain</Label>
          <Selector
            options={chains}
            onValueChange={handleChainChange}
            value={selectedChain}
            placeholder="Select a chain"
            aria-label="Chain Selector"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="token-select">Token</Label>
          <Selector
            options={availableTokens}
            onValueChange={setSelectedToken}
            value={selectedToken}
            placeholder="Select a token"
            disabled={!selectedChain}
            aria-label="Token Selector"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipient-address">Recipient Address</Label>
          <Input
            id="recipient-address"
            placeholder="Enter recipient address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
