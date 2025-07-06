"use client";

import { useState, useEffect } from "react";
import { type Address, parseUnits, formatUnits } from "viem";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useConfig } from "wagmi";
import { readContract as wagmiReadContract, waitForTransactionReceipt } from '@wagmi/core'
import { erc20Abi } from "viem";
import { toast } from "sonner";

import P2PExchangeABI from "../../P2PExchange.json";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

// Define the structure of an Offer based on your contract's Offer struct
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

export function P2PExchangeClient() {
  const { address, chain } = useAccount();
  const config = useConfig()

  const { data: hash, isPending: isWritePending, writeContractAsync, error: writeError } = useWriteContract();

  const [contractAddress, setContractAddress] = useState<Address>("0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const [tokenSell, setTokenSell] = useState<Address>("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
  const [amountSell, setAmountSell] = useState("111");
  const [tokenBuy, setTokenBuy] = useState<Address>("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
  const [amountBuy, setAmountBuy] = useState("222");

  const [fillOfferId, setFillOfferId] = useState("");
  const [cancelOfferId, setCancelOfferId] = useState("");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isActionPending, setIsActionPending] = useState(false); // For disabling buttons during multi-step actions

  const { data: openOfferIds, refetch: refetchOpenOffers } = useReadContract({
    abi: P2PExchangeABI.abi,
    address: contractAddress,
    functionName: "getOpenOffers",
    query: {
      enabled: !!contractAddress && contractAddress !== "0x",
    },
  });

  // Effect to fetch full offer details when openOfferIds are available
  useEffect(() => {
    const fetchOfferDetails = async () => {
      if (contractAddress && contractAddress !== "0x" && Array.isArray(openOfferIds)) {
        const fetchedOffers = await Promise.all(
          openOfferIds.map(async (id: bigint): Promise<Offer | null> => {
            try {
              const offerData = await wagmiReadContract(config, {
                abi: P2PExchangeABI.abi,
                address: contractAddress,
                functionName: 'offers',
                args: [id]
              }) as [Address, Address, bigint, Address, bigint, number];

              console.log("offerData:", offerData);

              const [tokenSellDecimals, tokenBuyDecimals, tokenSellSymbol, tokenBuySymbol] = await Promise.all([
                wagmiReadContract(config, { abi: erc20Abi, address: offerData[1], functionName: 'decimals' }),
                wagmiReadContract(config, { abi: erc20Abi, address: offerData[3], functionName: 'decimals' }),
                wagmiReadContract(config, { abi: erc20Abi, address: offerData[1], functionName: 'symbol' }),
                wagmiReadContract(config, { abi: erc20Abi, address: offerData[3], functionName: 'symbol' }),
              ]);

              return {
                id: id,
                maker: offerData[0],
                tokenSell: offerData[1],
                amountSell: offerData[2],
                tokenBuy: offerData[3],
                amountBuy: offerData[4],
                status: offerData[5],
                amountSellFormatted: formatUnits(offerData[2], tokenSellDecimals as number),
                amountBuyFormatted: formatUnits(offerData[4], tokenBuyDecimals as number),
                tokenSellSymbol: tokenSellSymbol as string,
                tokenBuySymbol: tokenBuySymbol as string,
              };
            } catch (error) {
              console.error(`Error fetching details for offer ${id}:`, error);
              toast.error(`Error fetching details for offer ${id}`, {
                description: error instanceof Error ? error.message : "Unknown error",
              });
              // Return a basic offer structure on error to still display the ID
              return { id, maker: '0x', tokenSell: '0x', amountSell: 0n, tokenBuy: '0x', amountBuy: 0n, status: 99 };
            }
          })
        );
        setOffers(fetchedOffers.filter(Boolean) as Offer[]);
      } else {
        setOffers([]);
      }
    };
    fetchOfferDetails();
  }, [openOfferIds, contractAddress, config]);


  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Transaction Confirmed!");
      refetchOpenOffers();
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
  }, [isConfirmed, writeError, receiptError, refetchOpenOffers]);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return toast.error("Wallet Not Connected", { description: "Please connect your wallet first." });
    if (!contractAddress || !tokenSell || !tokenBuy || !amountSell || !amountBuy) return toast.error("Missing Information", { description: "Please fill in all fields for creating an offer." });

    setIsActionPending(true);
    const toastId = "create-offer-process";
    toast.loading("Starting offer creation...", { id: toastId });

    try {
      // 1. Fetch Decimals
      toast.loading("Fetching token decimals...", { id: toastId });

      console.log("tokenSell:", tokenSell);
      console.log("tokenBuy:", tokenBuy)

      const [tokenSellDecimals, tokenBuyDecimals] = await Promise.all([
        wagmiReadContract(config, { abi: erc20Abi, address: tokenSell, functionName: 'decimals' }),
        wagmiReadContract(config, { abi: erc20Abi, address: tokenBuy, functionName: 'decimals' })
      ]);

      if (typeof tokenSellDecimals !== 'number' || typeof tokenBuyDecimals !== 'number') {
        throw new Error("Could not fetch token decimals. Check token addresses.");
      }

      // 2. Approve
      toast.loading("Requesting token approval...", { id: toastId });
      const parsedAmountSell = parseUnits(amountSell, tokenSellDecimals);
      const approveHash = await writeContractAsync({
        address: tokenSell,
        abi: erc20Abi,
        functionName: "approve",
        args: [contractAddress, parsedAmountSell],
      });

      // 3. Wait for Approval Confirmation
      toast.loading("Waiting for approval confirmation...", { id: toastId });
      await waitForTransactionReceipt(config, { hash: approveHash });
      toast.success("Token Approved!", { id: toastId });

      // 4. Create Offer
      toast.loading("Creating offer...", { id: toastId });
      await writeContractAsync({
        address: contractAddress,
        abi: P2PExchangeABI.abi,
        functionName: "createOffer",
        args: [tokenSell, parsedAmountSell, tokenBuy, parseUnits(amountBuy, tokenBuyDecimals)],
      });
      toast.success("Create Offer Transaction Sent!", { id: toastId, description: "Waiting for final confirmation..." });

    } catch (error) {
      console.error("Error creating offer:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error("Error Creating Offer", { id: toastId, description: errorMessage });
    } finally {
      setIsActionPending(false);
    }
  };

  const handleFillOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return toast.error("Wallet Not Connected", { description: "Please connect your wallet first." });
    if (!contractAddress || !fillOfferId) return toast.error("Missing Information", { description: "Please provide an Offer ID to fill." });

    setIsActionPending(true);
    const toastId = "fill-offer-process";
    toast.loading("Starting to fill offer...", { id: toastId });

    try {
        const offerIdBigInt = BigInt(fillOfferId);
        const offerToFill = offers.find(o => o.id === offerIdBigInt);

        if (!offerToFill || offerToFill.status !== 0) {
            throw new Error("Offer not found or it's not open.");
        }

        // 1. Approve
        toast.loading("Requesting token approval...", { id: toastId });
        const approveHash = await writeContractAsync({
            address: offerToFill.tokenBuy,
            abi: erc20Abi,
            functionName: "approve",
            args: [contractAddress, offerToFill.amountBuy],
        });

        // 2. Wait for Approval
        toast.loading("Waiting for approval confirmation...", { id: toastId });
        await waitForTransactionReceipt(config, { hash: approveHash });
        toast.success("Token Approved!", { id: toastId });

        // 3. Fill Offer
        toast.loading("Filling offer...", { id: toastId });
        await writeContractAsync({
            address: contractAddress,
            abi: P2PExchangeABI.abi,
            functionName: "fillOffer",
            args: [offerIdBigInt],
        });
        toast.success("Fill Offer Transaction Sent!", { id: toastId, description: "Waiting for final confirmation..." });

    } catch (error) {
        console.error("Error filling offer:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast.error("Error Filling Offer", { id: toastId, description: errorMessage });
    } finally {
        setIsActionPending(false);
    }
  };

  const handleCancelOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return toast.error("Wallet Not Connected");
    if (!contractAddress || !cancelOfferId) return toast.error("Missing Information");

    setIsActionPending(true);
    const toastId = "cancel-offer-process";
    toast.loading("Cancelling offer...", { id: toastId });

    try {
      await writeContractAsync({
        address: contractAddress,
        abi: P2PExchangeABI.abi,
        functionName: "cancelOffer",
        args: [BigInt(cancelOfferId)],
      });
      toast.success("Cancel Offer Transaction Sent!", { id: toastId, description: "Waiting for confirmation..." });
    } catch (error) {
      console.error("Error cancelling offer:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error("Error Cancelling Offer", { id: toastId, description: errorMessage });
    } finally {
      setIsActionPending(false);
    }
  };

  const isButtonDisabled = isWritePending || isConfirming || isActionPending;
  const buttonText = () => {
      if (isActionPending) return "Processing...";
      if (isConfirming) return "Confirming...";
      if (isWritePending) return "Check Wallet...";
      return "Create Offer";
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
          <CardTitle>P2P Exchange Contract</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="contract-address">Contract Address</Label>
            <Input id="contract-address" value={contractAddress} onChange={(e) => setContractAddress(e.target.value as Address)} placeholder="0x..." />
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
            <Button type="submit" disabled={isButtonDisabled}>{buttonText()}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fill Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFillOffer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fill-offer-id">Offer ID to Fill</Label>
              <Input id="fill-offer-id" value={fillOfferId} onChange={(e) => setFillOfferId(e.target.value)} placeholder="e.g., 0" type="number" />
            </div>
            <Button type="submit" disabled={isButtonDisabled}>Fill Offer</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cancel Offer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCancelOffer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-offer-id">Offer ID to Cancel</Label>
              <Input id="cancel-offer-id" value={cancelOfferId} onChange={(e) => setCancelOfferId(e.target.value)} placeholder="e.g., 0" type="number" />
            </div>
            <Button type="submit" disabled={isButtonDisabled}>Cancel Offer</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetchOpenOffers()} disabled={isButtonDisabled}>Refresh Open Offers</Button>
          {offers.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {offers.map((offer) => (
                <li key={offer.id.toString()} className="p-2 border rounded">
                  <div><strong>Offer ID:</strong> {offer.id.toString()}</div>
                  {offer.status === 99 ? (
                     <div className="text-red-500">Error fetching details</div>
                  ) : (
                    <>
                      <div><strong>Sell:</strong> {offer.amountSellFormatted} {offer.tokenSellSymbol} ({offer.tokenSell})</div>
                      <div><strong>Buy:</strong> {offer.amountBuyFormatted} {offer.tokenBuySymbol} ({offer.tokenBuy})</div>
                      <div><strong>Maker:</strong> {offer.maker}</div>
                      <div><strong>Status:</strong> {offer.status === 0 ? 'Open' : 'Closed'}</div>
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
    </div>
  );
}
