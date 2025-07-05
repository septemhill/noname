"use client";

import { useState } from "react";
import { type Address, parseEther } from "viem";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import P2PExchangeABI from "../../P2PExchange.json";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function P2PExchangeClient() {
  const { address } = useAccount();
  const { writeContractAsync, data: hash } = useWriteContract();

  const [contractAddress, setContractAddress] = useState<Address>("0x");
  const [tokenSell, setTokenSell] = useState<Address>("0x");
  const [amountSell, setAmountSell] = useState("");
  const [tokenBuy, setTokenBuy] = useState<Address>("0x");
  const [amountBuy, setAmountBuy] = useState("");

  const { data: openOffers, refetch } = useReadContract({
    abi: P2PExchangeABI.abi,
    address: contractAddress,
    functionName: "getOpenOffers",
    query: {
      enabled: contractAddress !== "0x",
    },
  });

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }
    if (contractAddress === "0x" || tokenSell === "0x" || tokenBuy === "0x" || !amountSell || !amountBuy) {
        alert("Please fill in all fields for creating an offer.");
        return;
    }

    try {
      await writeContractAsync({
        address: contractAddress,
        abi: P2PExchangeABI.abi,
        functionName: "createOffer",
        args: [tokenSell, parseEther(amountSell), tokenBuy, parseEther(amountBuy)],
      });
    } catch (error) {
      console.error("Error creating offer:", error);
      alert(`Error creating offer: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>P2P Exchange Contract</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="contract-address">Contract Address</Label>
            <Input
              id="contract-address"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value as Address)}
              placeholder="0x..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateOffer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token-sell">Token to Sell Address</Label>
              <Input
                id="token-sell"
                value={tokenSell}
                onChange={(e) => setTokenSell(e.target.value as Address)}
                placeholder="0x..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount-sell">Amount to Sell</Label>
              <Input
                id="amount-sell"
                value={amountSell}
                onChange={(e) => setAmountSell(e.target.value)}
                placeholder="e.g., 100"
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="token-buy">Token to Buy Address</Label>
              <Input
                id="token-buy"
                value={tokenBuy}
                onChange={(e) => setTokenBuy(e.target.value as Address)}
                placeholder="0x..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount-buy">Amount to Buy</Label>
              <Input
                id="amount-buy"
                value={amountBuy}
                onChange={(e) => setAmountBuy(e.target.value)}
                placeholder="e.g., 50"
                type="number"
              />
            </div>
            <Button type="submit" disabled={isConfirming}>
              {isConfirming ? 'Confirming...' : 'Create Offer'}
            </Button>
             {isConfirmed && <p>Transaction confirmed!</p>}
          </form>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Open Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()}>Get Open Offers</Button>
          {openOffers && (
            <ul className="mt-4 space-y-2">
              {(openOffers as bigint[]).map((offerId) => (
                <li key={offerId.toString()}>Offer ID: {offerId.toString()}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card> */}
    </div>
  );
}
