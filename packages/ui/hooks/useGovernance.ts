import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { contracts } from "@/lib/contracts";
import { Address } from "viem";

export function useCreateProposal() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const createProposal = async (
    targets: Address[],
    values: bigint[],
    calldatas: `0x${string}`[],
    description: string
  ) => {
    try {
      writeContract({
        ...contracts.governor,
        functionName: "propose",
        args: [targets, values, calldatas, description],
      });
    } catch (error) {
      console.error("Failed to create proposal.", error);
      throw error;
    }
  };
  return { createProposal, isPending, isConfirming };
}

export function useProposal(proposalId: bigint | undefined) {
  const { data: state } = useReadContract({
    ...contracts.governor,
    functionName: "state",
    args: [proposalId],
  });

  const { data: proposal } = useReadContract({
    ...contracts.governor,
    functionName: "proposalSnapshot",
    args: [proposalId],
  });

  return { state, proposal };
}

export function useDelegate() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const delegate = async (delegatee: Address) => {
    try {
      writeContract({
        ...contracts.governanceToken,
        functionName: "delegate",
        args: [delegatee],
      });
    } catch (error) {
      console.error("Failed to delegate voting power.", error);
      throw error;
    }
  };
  return { delegate, isPending, isConfirming };
}

export function useCastVote() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const castVote = async (proposalId: bigint, support: 0 | 1 | 2) => {
    try {
      writeContract({
        ...contracts.governor,
        functionName: "castVote",
        args: [proposalId, support],
      });
    } catch (error) {
      console.error("Failed to submit vote.", error);
      throw error;
    }
  };
  return { castVote, isPending, isConfirming };
}

export function useQueueProposal() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const queueProposal = (
    targets: Address[],
    values: bigint[],
    calldatas: `0x${string}`[],
    descriptionHash: `0x${string}`
  ) => {
    writeContract({
      ...contracts.governor,
      functionName: "queue",
      args: [targets, values, calldatas, descriptionHash],
    });
  };

  return { queueProposal, isPending, isConfirming };
}

export function useExecuteProposal() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const executeProposal = (
    targets: Address[],
    values: bigint[],
    calldatas: `0x${string}`[],
    descriptionHash: `0x${string}`
  ) => {
    writeContract({
      ...contracts.governor,
      functionName: "execute",
      args: [targets, values, calldatas, descriptionHash],
    });
  };

  return { executeProposal, isPending, isConfirming };
}
