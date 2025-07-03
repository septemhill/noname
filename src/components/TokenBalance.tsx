"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { useBalance } from "wagmi";
import { mainnet, optimism, sepolia } from "wagmi/chains";
import { tokens } from "@/lib/constants";

const allChains = [mainnet, optimism, sepolia];

export function TokenBalance({ address, token }: { address: `0x${string}`; token: typeof tokens[0] }) {
  const [tokenLogoUrl, setTokenLogoUrl] = useState<string | null>(null);

  const chain = useMemo(() => allChains.find((c) => c.id === token.chainId), [token.chainId]);

  useEffect(() => {
    if (chain && token.address) {
      setTokenLogoUrl(`https://token-icons.llamao.fi/icons/tokens/${chain.id}/${token.address}`);
    }
  }, [chain, token.address]);
  const { data, isLoading, error } = useBalance({
    address,
    token: token.address,
    chainId: token.chainId,
  });

  return (
    <li className="flex items-center justify-between py-2 border-b">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 flex-shrink-0">
          {tokenLogoUrl ? (
            <Image
              src={tokenLogoUrl}
              alt={`${token.name} logo`}
              width={24}
              height={24}
              className="rounded-full"
              onError={() => setTokenLogoUrl(null)}
            />
          ) : (
            <div className="w-full h-full rounded-full bg-muted" />
          )}
        </div>
        <span>{token.name} ({chain?.name})</span>
      </div>
      <span>
        {isLoading && "Loading..."}
        {error && "Error"}
        {data && `${parseFloat(data.formatted).toFixed(8)} ${data.symbol}`}
      </span>
    </li>
  );
}
