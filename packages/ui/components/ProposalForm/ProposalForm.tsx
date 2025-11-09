"use client";

import { useState } from "react";
import { useCreateProposal } from "@/hooks/useGovernance";
import { toast } from "react-hot-toast";

export default function ProposalForm() {
  const [description, setDescription] = useState("");
  const [targetAddress, setTargetAddress] = useState("");
  const [calldata, setCalldata] = useState("");
  const { createProposal, isPending } = useCreateProposal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      createProposal(
        [targetAddress as `0x${string}`],
        [BigInt(0)],
        [calldata as `0x${string}`],
        description
      );
      toast.success("Proposal submitted!");
    } catch (error) {
      toast.error("Failed to create proposal");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-lg p-6 space-y-4"
    >
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Proposal: Do something..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Target Address</label>
        <input
          type="text"
          value={targetAddress}
          onChange={(e) => setTargetAddress(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="0x..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Calldata</label>
        <input
          type="text"
          value={calldata}
          onChange={(e) => setCalldata(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="0x..."
          required
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create Proposal"}
      </button>
    </form>
  );
}
