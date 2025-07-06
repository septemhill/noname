"use client";

import { useState, useEffect } from "react";
import { type Address, parseUnits, formatUnits } from "viem";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";

import TestTokenABI from "../../out/TestToken.sol/TestToken.json";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function TestTokenClient() {
  const { address, chain } = useAccount();
  const { data: hash, isPending: isWritePending, writeContract, error: writeError } = useWriteContract();

  // TODO: Replace with your deployed TestToken contract address
  const [contractAddress, setContractAddress] = useState<Address>("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
  const [recipient, setRecipient] = useState<Address>("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  const [amount, setAmount] = useState("10");

  const { 
    data: totalSupply, 
    error: totalSupplyError,
    isLoading: isTotalSupplyLoading,
    refetch: refetchTotalSupply 
  } = useReadContract({
    abi: TestTokenABI.abi,
    address: contractAddress,
    functionName: "totalSupply",
    query: {
      enabled: !!contractAddress,
    },
  });

  console.log("totalSupply:", totalSupply);
  console.log("totalSupplyError:", totalSupplyError);
  console.log("isTotalSupplyLoading:", isTotalSupplyLoading);


  const { 
    data: balance, 
    error: balanceError,
    isLoading: isBalanceLoading,
    refetch: refetchBalance 
  } = useReadContract({
    abi: TestTokenABI.abi,
    address: contractAddress,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: !!address && !!contractAddress,
    },
  });

  const { 
    data: decimals,
    error: decimalsError,
    isLoading: isDecimalsLoading,
  } = useReadContract({
    abi: TestTokenABI.abi,
    address: contractAddress,
    functionName: "decimals",
    query: {
      enabled: !!contractAddress,
    },
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Transaction Confirmed!");
      refetchTotalSupply();
      refetchBalance();
      setAmount("0");
      setRecipient("0x"); // Reset to a valid but empty-like address
    }
    if (writeError) {
      toast.error("Transaction Failed", {
        description: `Error: ${writeError.message}`,
      });
    }
    if (receiptError) {
      toast.error("Confirmation Failed", {
        description: `Error: ${receiptError.message}`,
      });
    }
  }, [isConfirmed, writeError, receiptError, refetchTotalSupply, refetchBalance]);


  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return toast.error("Wallet Not Connected");
    if (!contractAddress || !recipient || !amount) return toast.error("Missing Information");
    if (typeof decimals !== 'number') return toast.error("Token decimals not loaded yet.");

    const parsedAmount = parseUnits(amount, decimals);

    writeContract({
      address: contractAddress,
      abi: TestTokenABI.abi,
      functionName: "transfer",
      args: [recipient, parsedAmount],
    });
  };

  const isButtonDisabled = isWritePending || isConfirming;
  const buttonText = () => {
      if (isConfirming) return "Confirming...";
      if (isWritePending) return "Check Wallet...";
      return "Transfer";
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          {address ? (
            <div className="space-y-2">
              <p><strong>Status:</strong> Connected</p>
              <p><strong>Address:</strong> {address}</p>
              <p><strong>Chain:</strong> {chain?.name} (ID: {chain?.id})</p>
            </div>
          ) : (
            <p>Status: Disconnected. Please connect your wallet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Token Contract</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="contract-address">Contract Address</Label>
            <Input id="contract-address" value={contractAddress} onChange={(e) => setContractAddress(e.target.value as Address)} placeholder="0x..." />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Supply</CardTitle>
          </CardHeader>
          <CardContent>
            {isTotalSupplyLoading || isDecimalsLoading ? (
              <p>Loading...</p>
            ) : totalSupplyError ? (
              <p className="text-red-500">Error: {totalSupplyError.shortMessage}</p>
            ) : decimalsError ? (
              <p className="text-red-500">Error fetching decimals: {decimalsError.shortMessage}</p>
            ) : (
              <p>{typeof totalSupply === 'bigint' && typeof decimals === 'number' ? formatUnits(totalSupply, decimals) : 'N/A'}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {isBalanceLoading || isDecimalsLoading ? (
              <p>Loading...</p>
            ) : balanceError ? (
              <p className="text-red-500">Error: {balanceError.shortMessage}</p>
            ) : decimalsError ? (
              <p className="text-red-500">Error fetching decimals: {decimalsError.shortMessage}</p>
            ) : (
              <p>{typeof balance === 'bigint' && typeof decimals === 'number' ? formatUnits(balance, decimals) : 'N/A'}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value as Address)} placeholder="0x..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 100" type="number" />
            </div>
            <Button type="submit" disabled={isButtonDisabled}>{buttonText()}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


