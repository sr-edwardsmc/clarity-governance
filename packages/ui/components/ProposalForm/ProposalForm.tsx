"use client";

import { useState } from "react";
import { Plus, Trash2, Info, FileText, Code } from "lucide-react";
import { useCreateProposal } from "@/hooks/useGovernance";
import { toast } from "react-hot-toast";
import { encodeFunctionData, parseAbi } from "viem";
import { Card, Button } from "@/components/ui";

type ProposalAction = {
  target: string;
  value: string;
  functionSignature: string;
  parameters: string;
};

export default function ProposalForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [actions, setActions] = useState<ProposalAction[]>([
    { target: "", value: "0", functionSignature: "", parameters: "" },
  ]);
  const { createProposal, isPending, isConfirming } = useCreateProposal();

  const addAction = () => {
    setActions([
      ...actions,
      { target: "", value: "0", functionSignature: "", parameters: "" },
    ]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (
    index: number,
    field: keyof ProposalAction,
    value: string
  ) => {
    const newActions = [...actions];
    newActions[index][field] = value;
    setActions(newActions);
  };

  const encodeCalldata = (
    functionSig: string,
    params: string
  ): `0x${string}` => {
    try {
      // Parse function signature: "setValue(uint256)"
      const abiString = `function ${functionSig}`;
      const abi = parseAbi([abiString]) as any;

      // Parse parameters (comma-separated)
      const paramValues = params.split(",").map((p) => p.trim());

      // Encode
      return encodeFunctionData({
        abi,
        functionName: functionSig.split("(")[0],
        args: paramValues,
      }) as `0x${string}`;
    } catch (error) {
      throw new Error("Invalid function signature or parameters");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate
      if (!title.trim() || !description.trim()) {
        toast.error("Title and description required");
        return;
      }

      if (actions.length === 0) {
        toast.error("At least one action required");
        return;
      }

      // Validate and encode all actions
      const targets: `0x${string}`[] = [];
      const values: bigint[] = [];
      const calldatas: `0x${string}`[] = [];

      for (const action of actions) {
        if (!action.target.match(/^0x[a-fA-F0-9]{40}$/)) {
          toast.error("Invalid target address");
          return;
        }

        targets.push(action.target as `0x${string}`);
        values.push(BigInt(action.value));

        const calldata = encodeCalldata(
          action.functionSignature,
          action.parameters
        );
        calldatas.push(calldata);
      }

      // Create full description
      const fullDescription = `# ${title}\n\n${description}`;

      // Submit proposal
      createProposal(targets, values, calldatas, fullDescription);

      toast.success("Proposal created! Waiting for confirmation...");

      // Reset form after success
      setTitle("");
      setDescription("");
      setActions([
        { target: "", value: "0", functionSignature: "", parameters: "" },
      ]);
    } catch (error: any) {
      toast.error(error.message || "Failed to create proposal");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <Card glow>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-primary" />
          <label className="text-sm font-medium text-foreground">
            Proposal Title *
          </label>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-background-tertiary border border-border rounded-lg text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          placeholder="e.g., Increase Treasury Allocation"
          required
        />
      </Card>

      {/* Description */}
      <Card glow>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-primary" />
          <label className="text-sm font-medium text-foreground">
            Description *
          </label>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 bg-background-tertiary border border-border rounded-lg text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary h-32 resize-none"
          placeholder="Explain what this proposal does and why..."
          required
        />
      </Card>

      {/* Actions */}
      <Card glow>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Actions</h3>
          </div>
          <Button
            type="button"
            onClick={addAction}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Action
          </Button>
        </div>

        <div className="space-y-4">
          {actions.map((action, index) => (
            <div
              key={index}
              className="border border-border rounded-lg p-4 bg-background-tertiary/50 space-y-3"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-foreground">
                  Action {index + 1}
                </span>
                {actions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    className="text-error hover:text-error/80 text-sm flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Target Contract Address *
                </label>
                <input
                  type="text"
                  value={action.target}
                  onChange={(e) => updateAction(index, "target", e.target.value)}
                  className="w-full px-3 py-2 bg-background-tertiary border border-border rounded-lg text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-mono text-sm"
                  placeholder="0x..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ETH Value (in wei)
                </label>
                <input
                  type="text"
                  value={action.value}
                  onChange={(e) => updateAction(index, "value", e.target.value)}
                  className="w-full px-3 py-2 bg-background-tertiary border border-border rounded-lg text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Function Signature *
                </label>
                <input
                  type="text"
                  value={action.functionSignature}
                  onChange={(e) =>
                    updateAction(index, "functionSignature", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-background-tertiary border border-border rounded-lg text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-mono text-sm"
                  placeholder="setValue(uint256)"
                  required
                />
                <p className="text-xs text-foreground-secondary mt-1.5">
                  Example: setValue(uint256) or transfer(address,uint256)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Parameters *
                </label>
                <input
                  type="text"
                  value={action.parameters}
                  onChange={(e) =>
                    updateAction(index, "parameters", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-background-tertiary border border-border rounded-lg text-foreground placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-mono text-sm"
                  placeholder="42 or 0x123..., 1000"
                />
                <p className="text-xs text-foreground-secondary mt-1.5">
                  Comma-separated values. Example: 42 or 0xAddress, 1000
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isPending || isConfirming}
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={isPending || isConfirming}
      >
        {isPending
          ? "Confirm in Wallet..."
          : isConfirming
          ? "Creating Proposal..."
          : "Create Proposal"}
      </Button>

      {/* Help Text */}
      <Card className="border-secondary/30">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-secondary/10 border border-secondary/30 flex-shrink-0">
            <Info className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <p className="font-bold text-foreground mb-3">
              How to create a proposal:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-foreground-secondary text-sm">
              <li>Add a clear title and description</li>
              <li>Specify the contract address to interact with</li>
              <li>Enter the function to call (e.g., setValue(uint256))</li>
              <li>Provide the parameters (e.g., 42)</li>
              <li>Review and submit - voting starts after 1 day delay</li>
            </ol>
          </div>
        </div>
      </Card>
    </form>
  );
}
