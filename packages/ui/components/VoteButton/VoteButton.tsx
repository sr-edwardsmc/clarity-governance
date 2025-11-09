"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { contracts } from "@/lib/contracts";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui";

interface VoteButtonProps {
  proposalId: bigint;
  support: 0 | 1 | 2; // 0 = Against, 1 = For, 2 = Abstain
}

export function VoteButton({ proposalId, support }: VoteButtonProps) {
  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleVote = async () => {
    try {
      writeContract({
        ...contracts.governor,
        functionName: "castVote",
        args: [proposalId, support],
      });

      toast.success("Vote submitted!");
    } catch (error) {
      toast.error("Failed to submit vote.");
      console.error(error);
    }
  };

  const getButtonConfig = () => {
    const isLoading = isPending || isConfirming;

    if (support === 1) {
      return {
        text: isLoading ? "Voting..." : "Vote For",
        variant: "success" as const,
        icon: <ThumbsUp className="w-4 h-4" />,
      };
    }

    if (support === 0) {
      return {
        text: isLoading ? "Voting..." : "Vote Against",
        variant: "danger" as const,
        icon: <ThumbsDown className="w-4 h-4" />,
      };
    }

    return {
      text: isLoading ? "Voting..." : "Abstain",
      variant: "secondary" as const,
      icon: <Minus className="w-4 h-4" />,
    };
  };

  const config = getButtonConfig();

  return (
    <Button
      onClick={handleVote}
      disabled={isPending || isConfirming}
      variant={config.variant}
      size="md"
      className="flex items-center gap-2"
    >
      {config.icon}
      {config.text}
    </Button>
  );
}
