"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { UserCheck, Info } from "lucide-react";
import { useDelegate } from "@/hooks/useGovernance";
import { toast } from "react-hot-toast";
import { Card, Button } from "@/components/ui";

export default function DelegateForm() {
  const { address } = useAccount();
  const [delegatee, setDelegatee] = useState("");
  const { delegate, isPending } = useDelegate();

  const handleDelegate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      delegate(delegatee as `0x${string}`);
      toast.success("Delegation successful!");
    } catch (error) {
      toast.error("Failed to delegate");
    }
  };

  const delegateToSelf = () => {
    if (address) {
      setDelegatee(address);
      delegate(address);
      toast.success("Delegated to yourself!");
    }
  };

  return (
    <Card glow>
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2 rounded-lg bg-linear-to-br from-primary/20 to-secondary/20 border border-primary/30">
          <UserCheck className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1 text-foreground">
            Delegate Your Votes
          </h2>
          <p className="text-foreground-secondary text-sm">
            Transfer your voting power to another address or delegate to
            yourself
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 rounded-lg bg-secondary/10 border border-secondary/30">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <div className="text-sm text-foreground-secondary">
            <p className="font-medium text-foreground mb-1">About Delegation</p>
            <p>
              Delegating allows you to assign your voting power to another
              address. You can delegate to yourself to activate your voting
              power, or to a trusted representative to vote on your behalf.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleDelegate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Delegate Address
          </label>
          <input
            type="text"
            value={delegatee}
            onChange={(e) => setDelegatee(e.target.value)}
            className="w-full px-4 py-3 bg-background-tertiary border border-border rounded-lg text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-mono text-sm"
            placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
            required
          />
          <p className="mt-2 text-xs text-foreground-secondary">
            Enter the Ethereum address you want to delegate your voting power to
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="submit"
            disabled={isPending}
            variant="primary"
            size="lg"
            className="flex-1"
            isLoading={isPending}
          >
            {!isPending && "Delegate to Address"}
          </Button>

          <Button
            type="button"
            onClick={delegateToSelf}
            variant="secondary"
            size="lg"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Self-Delegate
          </Button>
        </div>
      </form>

      {/* Current Delegation Status */}
      <div className="mt-6 pt-6 border-t border-border/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground-secondary">Your Address:</span>
          <code className="text-foreground font-mono text-xs bg-background-tertiary px-2 py-1 rounded">
            {address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : "Not connected"}
          </code>
        </div>
      </div>
    </Card>
  );
}
