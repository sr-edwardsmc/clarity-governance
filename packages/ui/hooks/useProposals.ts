import { contracts } from "@/lib/contracts";
import { useReadContract } from "wagmi";

export function useProposals() {
  const {
    data: proposals,
    isLoading,
    error,
  } = useReadContract({
    ...contracts.governor,
    functionName: "getProposals",
    query: { enabled: true },
  });

  return { proposals, isLoading, error };
}
