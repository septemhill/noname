"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Selector } from "./Selector";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { allChains, tokens } from "@/lib/constants";
import { useAccount, useBalance, useFeeData, useSimulateContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { erc20Abi } from "viem";
import type { Address } from "viem";

// Prepare Selector data
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

// 安全 parseUnits，避免錯誤拋出
function safeParseUnits(amountStr: string, decimals: number = 18): bigint {
  try {
    return parseUnits(amountStr, decimals);
  } catch {
    return BigInt(0);
  }
}

export function TransferComponent() {
  const { address } = useAccount();
  const [selectedChain, setSelectedChain] = React.useState<string>("");
  const [availableTokens, setAvailableTokens] = React.useState<{ value: string; label: string }[]>([]);
  const [selectedToken, setSelectedToken] = React.useState<string>("");
  const [recipientAddress, setRecipientAddress] = React.useState<string>("");
  const [amount, setAmount] = React.useState<string>("");
  const [nativeBalance, setNativeBalance] = React.useState<string>("");
  const [tokenBalance, setTokenBalance] = React.useState<string>("");
  const [gasFee, setGasFee] = React.useState<string>("");
  const [txHash, setTxHash] = React.useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);

  const { data: feeData } = useFeeData();
  const chainId = selectedChain ? parseInt(selectedChain) : undefined;

  const { data: nativeBalanceData, isLoading: isNativeBalanceLoading } = useBalance({
    address,
    chainId,
    query: { enabled: !!address && !!chainId },
  });

  const { data: tokenBalanceData, isLoading: isTokenBalanceLoading } = useBalance({
    address,
    token: selectedToken as Address,
    chainId,
    query: { enabled: !!address && !!selectedToken && !!chainId },
  });

  const decimals = tokenBalanceData?.decimals || 18;
  const isValidAmount = /^\d+(\.\d{1,18})?$/.test(amount);
  const isSimulatable = !!selectedToken && !!recipientAddress && !!isValidAmount && !!chainId;

  const { data: simulationResult } = useSimulateContract({
    address: selectedToken as Address,
    abi: erc20Abi,
    functionName: 'transfer',
    args: [recipientAddress as Address, safeParseUnits(amount, decimals)],
    chainId,
    query: {
      enabled: isSimulatable,
    },
  });

  const estimatedGas = simulationResult?.request.gas;

  const { writeContract, isPending, isSuccess } = useWriteContract();

  React.useEffect(() => {
    if (estimatedGas && feeData?.gasPrice && nativeBalanceData?.decimals != null) {
      const fee = estimatedGas * feeData.gasPrice;
      const formatted = formatUnits(fee, nativeBalanceData.decimals);
      setGasFee(`${parseFloat(formatted).toFixed(8)} ${nativeBalanceData.symbol}`);
    } else {
      setGasFee("");
    }
  }, [estimatedGas, feeData, nativeBalanceData]);

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
    setGasFee("");
    setAvailableTokens(tokensByChainId[chainId] || []);
  };

  const handleTokenChange = (tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    setTokenBalance("");
    setGasFee("");
  };

  const handlePreview = () => {
    if (!selectedChain || !selectedToken || !recipientAddress || !amount) {
      alert("Please fill out all fields.");
      return;
    }
    setIsDialogOpen(true);
  };

  const handleConfirmTransfer = () => {
    if (!simulationResult?.request) {
      alert("Transaction could not be prepared. Please check the details.");
      return;
    }
    writeContract(simulationResult.request, {
      onSuccess: (hash) => {
        setTxHash(hash);
        setIsDialogOpen(false);
      },
      onError: () => {
        setIsDialogOpen(false);
      }
    });
  };

  const selectedChainInfo = allChains.find(c => String(c.id) === selectedChain);
  const selectedTokenInfo = availableTokens.find(t => t.value === selectedToken);

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
          />
        </div>

        {isNativeBalanceLoading && <p className="text-sm text-muted-foreground">Fetching native balance...</p>}
        {nativeBalance && !isNativeBalanceLoading && (
          <div className="text-sm text-muted-foreground">Balance: {nativeBalance}</div>
        )}

        <div className="space-y-2">
          <Label htmlFor="token-select">Token</Label>
          <Selector
            options={availableTokens}
            onValueChange={handleTokenChange}
            value={selectedToken}
            placeholder="Select a token"
            disabled={!selectedChain}
          />
        </div>

        {isTokenBalanceLoading && <p className="text-sm text-muted-foreground">Fetching token balance...</p>}
        {tokenBalance && !isTokenBalanceLoading && (
          <div className="text-sm text-muted-foreground">Balance: {tokenBalance}</div>
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

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {gasFee && (
          <div className="text-sm text-muted-foreground">
            Estimated Gas Fee: {gasFee}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handlePreview} className="w-full">
              Preview Transfer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transaction Preview</DialogTitle>
              <DialogDescription>
                Please review the details of your transaction before confirming.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <p><strong>Chain:</strong> {selectedChainInfo?.label}</p>
              <p><strong>Token:</strong> {selectedTokenInfo?.label}</p>
              <p><strong>Amount:</strong> {amount}</p>
              <p><strong>Recipient:</strong> {recipientAddress}</p>
              <p><strong>Estimated Gas Fee:</strong> {gasFee}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmTransfer} disabled={isPending}>
                {isPending ? "Confirming..." : "Confirm Transfer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isSuccess && txHash && (
          <div className="text-sm text-green-500">
            Transaction successful!{' '}
            <a
              href={`${selectedChainInfo?.blockExplorers?.default.url}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View on Explorer
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
