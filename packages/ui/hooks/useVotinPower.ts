import { useReadContract } from "wagmi";
import { contracts } from "@/lib/contracts";
import { Address } from "viem";

export function useVotingPower(address: Address | undefined) {
  const {
    data: votingPower,
    isLoading,
    error,
  } = useReadContract({
    ...contracts.governanceToken,
    functionName: "getVotes",
    args: address ? [address] : [],
    query: { enabled: !!address },
  });

  return { votingPower, isLoading, error };
}
