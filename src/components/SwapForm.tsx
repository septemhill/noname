"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PreviewDialog } from "@/components/PreviewDialog";


interface Chain {
  id: number;
  name: string;
}
import { Address } from "viem";

interface Token {
  address: Address;
  chainId: number;
  name: string;
}

interface SwapFormProps {
  chains: Chain[];
  tokens: Token[];
}

export function SwapForm({ chains, tokens }: SwapFormProps) {
  const [selectedChain, setSelectedChain] = useState<Chain>(chains[0]);
  const [selectedToken, setSelectedToken] = useState<Token>(tokens.find(token => token.chainId === chains[0].id) || tokens[0]);
  const [amount, setAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChainChange = (chain: Chain) => {
    setSelectedChain(chain);
    // Reset selected token when chain changes, or try to find a token on the new chain
    const newToken = tokens.find(token => token.chainId === chain.id);
    setSelectedToken(newToken || tokens[0]);
  };

  const handleTokenChange = (token: Token) => {
    setSelectedToken(token);
  };

  const handlePreview = () => {
    // Here you would typically fetch more detailed information based on inputs
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    // Contract interaction logic will go here
    console.log("Confirming swap...");
    console.log("Chain:", selectedChain.name);
    console.log("Token:", selectedToken.name);
    console.log("Amount:", amount);
    setIsModalOpen(false);
  };

  const filteredTokens = tokens.filter(token => token.chainId === selectedChain.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Swap Tokens</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
      

      <div className="space-y-2">
        <Label htmlFor="chain-select">Chain</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between" id="chain-select">
              {selectedChain.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
            {chains.map((chain) => (
              <DropdownMenuItem key={chain.id} onClick={() => handleChainChange(chain)}>
                {chain.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <Label htmlFor="token-select">Token</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between" id="token-select">
              {selectedToken.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
            {filteredTokens.map((token) => (
              <DropdownMenuItem key={token.address} onClick={() => handleTokenChange(token)}>
                {token.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <Button className="w-full" onClick={handlePreview}>
        Preview Swap
      </Button>

      <PreviewDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Swap Details"
        description="Review the details of your swap before confirming."
        previewInfo={{
          Chain: selectedChain.name,
          Token: selectedToken.name,
          Amount: amount,
          "Estimated Receive": `${parseFloat(amount) * 0.99} ${selectedToken.name} (example)`,
          "Gas Fee": "0.001 ETH (example)",
        }}
        onConfirm={handleConfirm}
        confirmButtonText="Confirm Swap"
      />
      </CardContent>
    </Card>
  );
}
