
import { TestTokenClient } from "@/components/TestTokenClient";
import { allChains, tokens } from "@/lib/constants";

export default function SwapPage() {
  const serializableChains = allChains.map(chain => ({
    id: chain.id,
    name: chain.name,
  }));

  return (
    <div className="px-4 pt-24">
      <TestTokenClient />
      {/* <SwapForm chains={serializableChains} tokens={tokens} /> */}

    </div>
  );
}
