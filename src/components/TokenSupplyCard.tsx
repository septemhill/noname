"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPublicClient, http, formatUnits, Chain } from "viem";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const erc20Abi = [
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function"
  }
] as const;

interface TokenSupplyCardProps {
  tokenAddress: `0x${string}`;
  chain: Chain;
}

export default function TokenSupplyCard({ tokenAddress, chain }: TokenSupplyCardProps) {
  const [totalSupply, setTotalSupply] = useState<string | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState<string | null>(null);
  const [tokenLogoUrl, setTokenLogoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const publicClient = useMemo(() => createPublicClient({
    chain: chain,
    transport: http(),
  }), [chain]);

  useEffect(() => {
    async function fetchTokenData() {
      // Reset state when address or chain changes
      setTotalSupply(null);
      setTokenSymbol(null);
      setTokenName(null);
      setTokenLogoUrl(null);
      setError(null);

      try {
        const [supply, decimals, symbol, name] = await Promise.all([
          publicClient.readContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "totalSupply",
          }),
          publicClient.readContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "decimals",
          }),
          publicClient.readContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "symbol",
          }),
          publicClient.readContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: "name",
          }),
        ]);

        const formattedSupply = formatUnits(supply, decimals);
        setTotalSupply(formattedSupply);
        setTokenSymbol(symbol);
        setTokenName(name);
        setTokenLogoUrl(`https://token-icons.llamao.fi/icons/tokens/${chain.id}/${tokenAddress}`);
      } catch (err) {
        console.error(err);
        setError(`Failed to fetch token data on ${chain.name}.`);
        setTotalSupply(null);
        setTokenSymbol(null);
        setTokenName(null);
      }
    }

    if (tokenAddress && publicClient) {
      fetchTokenData();
    }
  }, [tokenAddress, publicClient, chain.name, chain.id]);

  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex-shrink-0">
              {tokenLogoUrl ? (
                <Image
                  src={tokenLogoUrl}
                  alt={`${tokenName ?? 'Token'} logo`}
                  width={24}
                  height={24}
                  className="rounded-full"
                  onError={() => setTokenLogoUrl(null)}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-muted" />
              )}
            </div>
            <span>{tokenName ? `${tokenName} (${tokenSymbol})` : "Token"}</span>
          </div>
        </CardTitle>
        <CardDescription className="break-words">
          {chain.name}:{" "}
          {chain.blockExplorers?.default.url ? (
            <a
              href={`${chain.blockExplorers.default.url}/token/${tokenAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-500 text-xs"
            >
              {tokenAddress}
            </a>
          ) : (
            <span className="text-xs">{tokenAddress}</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500">{error}</p>}
        {totalSupply && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Supply
              </p>
              <p className="text-xl font-bold break-words">
                {totalSupply}
              </p>
            </div>
          </div>
        )}
        {!error && !totalSupply && <p>Loading...</p>}
      </CardContent>
    </Card>
  );
}
