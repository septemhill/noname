import { type Address } from "viem";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface P2PCreateOfferFormProps {
  tokenSell: Address;
  setTokenSell: (address: Address) => void;
  amountSell: string;
  setAmountSell: (amount: string) => void;
  tokenBuy: Address;
  setTokenBuy: (address: Address) => void;
  amountBuy: string;
  setAmountBuy: (amount: string) => void;
  isButtonDisabled: boolean;
  buttonText: string;
  onCreateOffer: (e: React.FormEvent) => Promise<void>;
}

export function P2PCreateOfferForm({
  tokenSell,
  setTokenSell,
  amountSell,
  setAmountSell,
  tokenBuy,
  setTokenBuy,
  amountBuy,
  setAmountBuy,
  isButtonDisabled,
  buttonText,
  onCreateOffer,
}: P2PCreateOfferFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Offer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onCreateOffer} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token-sell">Token to Sell Address</Label>
            <Input id="token-sell" value={tokenSell} onChange={(e) => setTokenSell(e.target.value as Address)} placeholder="0x..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount-sell">Amount to Sell</Label>
            <Input id="amount-sell" value={amountSell} onChange={(e) => setAmountSell(e.target.value)} placeholder="e.g., 100" type="number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token-buy">Token to Buy Address</Label>
            <Input id="token-buy" value={tokenBuy} onChange={(e) => setTokenBuy(e.target.value as Address)} placeholder="0x..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount-buy">Amount to Buy</Label>
            <Input id="amount-buy" value={amountBuy} onChange={(e) => setAmountBuy(e.target.value)} placeholder="e.g., 50" type="number" />
          </div>
          <Button type="submit" disabled={isButtonDisabled}>{buttonText}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
