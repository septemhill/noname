"use client";

import { type Address } from "viem";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface Offer {
  id: bigint;
  maker: Address;
  tokenSell: Address;
  amountSell: bigint;
  tokenBuy: Address;
  amountBuy: bigint;
  status: number; // Assuming 0: Open, 1: Filled, 2: Cancelled
  tokenSellSymbol?: string;
  tokenBuySymbol?: string;
  amountSellFormatted?: string;
  amountBuyFormatted?: string;
}

interface OpenOffersListProps {
  offers: Offer[];
  address: Address | undefined;
  isButtonDisabled: boolean;
  refetchOpenOffers: () => void;
  handleFillOffer: (offerId: bigint) => Promise<void>;
  handleCancelOffer: (offerId: bigint) => Promise<void>;
}

export function OpenOffersList({
  offers,
  address,
  isButtonDisabled,
  refetchOpenOffers,
  handleFillOffer,
  handleCancelOffer,
}: OpenOffersListProps) {
  console.log("Connected Address:", address);
  console.log("Open Offers:", offers);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Offers</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={refetchOpenOffers} disabled={isButtonDisabled}>
          Refresh Open Offers
        </Button>
        {offers.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {offers.map((offer) => (
              <li key={offer.id.toString()} className="p-2 border rounded">
                <div><strong>Offer ID:</strong> {offer.id.toString()}</div>
                {console.log(`Offer ID: ${offer.id.toString()}, Maker: ${offer.maker}, Connected Address: ${address}, Is Maker: ${offer.maker === address}`)}
                {offer.status === 99 ? (
                  <div className="text-red-500">Error fetching details</div>
                ) : (
                  <>
                    <div><strong>Sell:</strong> {offer.amountSellFormatted} {offer.tokenSellSymbol} ({offer.tokenSell})</div>
                    <div><strong>Buy:</strong> {offer.amountBuyFormatted} {offer.tokenBuySymbol} ({offer.tokenBuy})</div>
                    <div><strong>Maker:</strong> {offer.maker}</div>
                    <div><strong>Status:</strong> {offer.status === 0 ? 'Open' : 'Closed'}</div>
                    <div className="mt-2">
                      {address && offer.maker === address ? (
                        <Button onClick={() => handleCancelOffer(offer.id)} disabled={isButtonDisabled}>
                          Cancel Offer
                        </Button>
                      ) : (
                        <Button onClick={() => handleFillOffer(offer.id)} disabled={isButtonDisabled}>
                          Fill Offer
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4">No open offers found.</p>
        )}
      </CardContent>
    </Card>
  );
}
