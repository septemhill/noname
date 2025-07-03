"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Selector } from "./Selector";
import { Button } from "@/components/ui/button";
import { allChains, tokens } from "@/lib/constants";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import type { Address } from "viem";

// Prepare data for the Selector components
const chainOptions = allChains.map(chain => ({
  value: String(chain.id),
  label: chain.name,
}));

const tokensByChainId = tokens.reduce((acc, token) => {
  const chainIdStr = String(token.chainId);
  if (!acc[chainIdStr]) {
    acc[chainIdStr] = [];
  }
  acc[chainIdStr].push({ value: token.address, label: token.name });
  return acc;
}, {} as { [key: string]: { value: string; label: string }[] });


export function TransferComponent() {
  const { address } = useAccount();
  const [selectedChain, setSelectedChain] = React.useState<string>("");
  const [availableTokens, setAvailableTokens] = React.useState<{ value: string; label: string }[]>([]);
  const [selectedToken, setSelectedToken] = React.useState<string>("");
  const [recipientAddress, setRecipientAddress] = React.useState<string>("");
  const [nativeBalance, setNativeBalance] = React.useState<string>("");
  const [tokenBalance, setTokenBalance] = React.useState<string>("");

  const chainId = selectedChain ? parseInt(selectedChain) : undefined;

  // Hook for native currency balance
  const { data: nativeBalanceData, isLoading: isNativeBalanceLoading } = useBalance({
    address: address,
    chainId: chainId,
    enabled: !!address && !!chainId,
  });

  // Hook for selected token balance
  const { data: tokenBalanceData, isLoading: isTokenBalanceLoading } = useBalance({
    address: address,
    token: selectedToken as Address | undefined,
    chainId: chainId,
    enabled: !!address && !!selectedToken && !!chainId,
  });

  React.useEffect(() => {
    if (nativeBalanceData) {
      const formattedBalance = formatUnits(nativeBalanceData.value, nativeBalanceData.decimals);
      setNativeBalance(`${parseFloat(formattedBalance).toFixed(4)} ${nativeBalanceData.symbol}`);
    } else {
      setNativeBalance("");
    }
  }, [nativeBalanceData]);

  React.useEffect(() => {
    if (tokenBalanceData) {
      const formattedBalance = formatUnits(tokenBalanceData.value, tokenBalanceData.decimals);
      setTokenBalance(`${parseFloat(formattedBalance).toFixed(4)} ${tokenBalanceData.symbol}`);
    } else {
      setTokenBalance("");
    }
  }, [tokenBalanceData]);

  const handleChainChange = (chainId: string) => {
    setSelectedChain(chainId);
    setSelectedToken("");
    setNativeBalance("");
    setTokenBalance("");
    setAvailableTokens(tokensByChainId[chainId] || []);
  };

  const handleTokenChange = (tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    setTokenBalance("");
  };

  const handleTransfer = () => {
    if (!selectedChain || !selectedToken || !recipientAddress) {
      alert("Please fill out all fields.");
      return;
    }
    console.log("Transfer Details:");
    console.log("  Chain ID:", selectedChain);
    console.log("  Token Address:", selectedToken);
    console.log("  Recipient:", recipientAddress);
    alert("Transaction confirmed! Check the console for details.");
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
            options={chainOptions}
            onValueChange={handleChainChange}
            value={selectedChain}
            placeholder="Select a chain"
            aria-label="Chain Selector"
          />
        </div>

        {isNativeBalanceLoading && <p className="text-sm text-muted-foreground">Fetching native balance...</p>}
        {nativeBalance && !isNativeBalanceLoading && (
          <div className="text-sm text-muted-foreground">
            Balance: {nativeBalance}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="token-select">Token</Label>
          <Selector
            options={availableTokens}
            onValueChange={handleTokenChange}
            value={selectedToken}
            placeholder="Select a token"
            disabled={!selectedChain}
            aria-label="Token Selector"
          />
        </div>
        
        {isTokenBalanceLoading && <p className="text-sm text-muted-foreground">Fetching token balance...</p>}
        {tokenBalance && !isTokenBalanceLoading && (
          <div className="text-sm text-muted-foreground">
            Balance: {tokenBalance}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="recipient-address">Recipient Address</Label>
          <Input
            id="recipient-address"
            placeholder="Enter recipient address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
        </div>
        <Button onClick={handleTransfer} className="w-full">
          Confirm Transfer
        </Button>
      </CardContent>
    </Card>
  );
}

