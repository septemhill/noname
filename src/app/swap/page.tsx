
import { SwapForm } from "@/components/SwapForm";
import { allChains, tokens } from "@/lib/constants";

export default function SwapPage() {
  const serializableChains = allChains.map(chain => ({
    id: chain.id,
    name: chain.name,
  }));

  return (
    <div className="px-16 pt-24">
      <SwapForm chains={serializableChains} tokens={tokens} />
    </div>
  );
}
