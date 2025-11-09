import { Address } from "viem";
import GovernanceTokenABI from "./abis/GovernanceToken.json";
import GovernorContractABI from "./abis/GovernorContract.json";

export const contracts = {
  governanceToken: {
    address: process.env.NEXT_PUBLIC_GOVERNANCE_TOKEN_ADDRESS as Address,
    abi: GovernanceTokenABI.abi,
  },
  governor: {
    address: process.env.NEXT_PUBLIC_GOVERNOR_ADDRESS as Address,
    abi: GovernorContractABI.abi,
  },
} as const;
