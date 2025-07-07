"use client";

import { useState, useEffect } from "react";
import { type Address, parseUnits, formatUnits } from "viem";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useConfig } from "wagmi";
import { readContract as wagmiReadContract, waitForTransactionReceipt } from '@wagmi/core'
import { erc20Abi } from "viem";
import { toast } from "sonner";

import P2PExchangeABI from "../../P2PExchange.json";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { P2PCreateOfferForm } from "./P2PCreateOfferForm";
import { OpenOffersList } from "./OpenOffersList";

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

  console.log("contractAddress:", contractAddress);

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
              }) as [bigint, Address, Address, bigint, Address, bigint, number];

              console.log("[SEPTEM DEBUG offerData]:", offerData);

              const [tokenSellDecimals, tokenBuyDecimals, tokenSellSymbol, tokenBuySymbol] = await Promise.all([
                wagmiReadContract(config, { abi: erc20Abi, address: offerData[2], functionName: 'decimals' }),
                wagmiReadContract(config, { abi: erc20Abi, address: offerData[4], functionName: 'decimals' }),
                wagmiReadContract(config, { abi: erc20Abi, address: offerData[2], functionName: 'symbol' }),
                wagmiReadContract(config, { abi: erc20Abi, address: offerData[4], functionName: 'symbol' }),
              ]);

              return {
                id: id,
                maker: offerData[1],
                tokenSell: offerData[2],
                amountSell: offerData[3],
                tokenBuy: offerData[4],
                amountBuy: offerData[5],
                status: offerData[6],
                amountSellFormatted: formatUnits(offerData[3], tokenSellDecimals as number),
                amountBuyFormatted: formatUnits(offerData[5], tokenBuyDecimals as number),
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

  const handleCreateOffer = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!address) {
      toast.error("Wallet Not Connected", { description: "Please connect your wallet first." });
      return;
    }
    if (!contractAddress || !tokenSell || !tokenBuy || !amountSell || !amountBuy) {
      toast.error("Missing Information", { description: "Please fill in all fields for creating an offer." });
      return;
    }

    setIsActionPending(true);
    const toastId = "create-offer-process";
    toast.loading("Starting offer creation...", { id: toastId });

    try {
      // 1. Fetch Decimals
      toast.loading("Fetching token decimals...", { id: toastId });

      

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

  const handleFillOffer = async (offerId: bigint) => {
    if (!address) {
        toast.error("Wallet Not Connected", { description: "Please connect your wallet first." });
        return;
    }
    if (!contractAddress || !offerId) {
        toast.error("Missing Information", { description: "Please provide an Offer ID to fill." });
        return;
    }

    setIsActionPending(true);
    const toastId = "fill-offer-process";
    toast.loading("Starting to fill offer...", { id: toastId });

    try {
        const offerToFill = offers.find(o => o.id === offerId);

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
            args: [offerId],
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

  const handleCancelOffer = async (offerId: bigint) => {
    if (!address) {
        toast.error("Wallet Not Connected");
        return;
    }
    if (!contractAddress || !offerId) {
        toast.error("Missing Information");
        return;
    }

    setIsActionPending(true);
    const toastId = "cancel-offer-process";
    toast.loading("Cancelling offer...", { id: toastId });

    try {
      await writeContractAsync({
        address: contractAddress,
        abi: P2PExchangeABI.abi,
        functionName: "cancelOffer",
        args: [offerId],
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

      <P2PCreateOfferForm
        tokenSell={tokenSell}
        setTokenSell={setTokenSell}
        amountSell={amountSell}
        setAmountSell={setAmountSell}
        tokenBuy={tokenBuy}
        setTokenBuy={setTokenBuy}
        amountBuy={amountBuy}
        setAmountBuy={setAmountBuy}
        isButtonDisabled={isButtonDisabled}
        buttonText={buttonText()}
        onCreateOffer={handleCreateOffer}
      />

      <OpenOffersList
        offers={offers}
        address={address}
        isButtonDisabled={isButtonDisabled}
        refetchOpenOffers={refetchOpenOffers}
        handleFillOffer={handleFillOffer}
        handleCancelOffer={handleCancelOffer}
      />
    </div>
  );
}
