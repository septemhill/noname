import { mainnet, optimism, sepolia } from "wagmi/chains";

export const tokens = [
  { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", chainId: mainnet.id, name: "WETH" },
  { address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", chainId: mainnet.id, name: "WBTC" },
  { address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", chainId: optimism.id, name: "USDC" },
  { address: "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9", chainId: sepolia.id, name: "PyUSD" },
];
