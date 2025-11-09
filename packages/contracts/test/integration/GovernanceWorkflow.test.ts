import { expect } from "chai";
import { ethers } from "hardhat";
import { time, mine } from "@nomicfoundation/hardhat-network-helpers";
import {
  GovernanceToken,
  GovernorContract,
  TimelockController,
  MockTarget,
} from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Governance Workflow", function () {
  let token: GovernanceToken;
  let governor: GovernorContract;
  let timelock: TimelockController;
  let mockTarget: MockTarget;

  let owner: HardhatEthersSigner;
  let proposer: HardhatEthersSigner;
  let voter1: HardhatEthersSigner;
  let voter2: HardhatEthersSigner;
  let voter3: HardhatEthersSigner;

  const VOTING_DELAY = 7200; // blocks
  const VOTING_PERIOD = 50400; // blocks
  const MIN_DELAY = 2 * 24 * 60 * 60; // 2 days in seconds

  beforeEach(async function () {
    [owner, proposer, voter1, voter2, voter3] = await ethers.getSigners();

    // Deploy token
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    token = await GovernanceToken.deploy(owner.address);
    await token.waitForDeployment();

    // Deploy timelock
    const TimelockController = await ethers.getContractFactory(
      "TimelockController"
    );
    timelock = await TimelockController.deploy(
      MIN_DELAY,
      [],
      [],
      owner.address
    );
    await timelock.waitForDeployment();

    // Deploy governor
    const Governor = await ethers.getContractFactory("GovernorContract");
    governor = await Governor.deploy(
      await token.getAddress(),
      await timelock.getAddress()
    );
    await governor.waitForDeployment();

    // Deploy mock target
    const MockTarget = await ethers.getContractFactory("MockTarget");
    mockTarget = await MockTarget.deploy();
    await mockTarget.waitForDeployment();

    // Setup roles
    const proposerRole = await timelock.PROPOSER_ROLE();
    const executorRole = await timelock.EXECUTOR_ROLE();
    const adminRole = await timelock.DEFAULT_ADMIN_ROLE();

    await timelock.grantRole(proposerRole, await governor.getAddress());
    await timelock.grantRole(executorRole, ethers.ZeroAddress);
    await timelock.revokeRole(adminRole, owner.address);

    // Distribute tokens and delegate
    const voterAmount = ethers.parseEther("1000000");

    await token.transfer(proposer.address, ethers.parseEther("3000000"));
    await token.transfer(voter1.address, voterAmount);
    await token.transfer(voter2.address, voterAmount);
    await token.transfer(voter3.address, voterAmount);

    await token.connect(proposer).delegate(proposer.address);
    await token.connect(voter1).delegate(voter1.address);
    await token.connect(voter2).delegate(voter2.address);
    await token.connect(voter3).delegate(voter3.address);

    // Mine a block to activate voting power
    await mine(1);
  });

  describe("Complete Governance Cycle", function () {
    it("Should complete full proposal lifecycle", async function () {
      // 1. Create Proposal
      const newValue = 42;
      const encodedFunctionCall = mockTarget.interface.encodeFunctionData(
        "setValue",
        [newValue]
      );

      const proposeTx = await governor
        .connect(proposer)
        .propose(
          [await mockTarget.getAddress()],
          [0],
          [encodedFunctionCall],
          "Proposal #1: Set value to 42"
        );

      const proposeReceipt = await proposeTx.wait();
      const proposalCreatedEvent = proposeReceipt?.logs.find((log) => {
        try {
          const parsed = governor.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });
          return parsed?.name === "ProposalCreated";
        } catch {
          return false;
        }
      });

      const parsedEvent = governor.interface.parseLog({
        topics: proposalCreatedEvent!.topics as string[],
        data: proposalCreatedEvent!.data,
      });
      const proposalId = parsedEvent?.args?.proposalId;

      console.log("✓ Proposal created");

      // 2. Wait for voting delay
      await mine(VOTING_DELAY + 1);

      // 3. Vote on proposal
      // proposer: For
      await governor.connect(proposer).castVote(proposalId!, 1);
      console.log("✓ Proposer voted FOR");

      // voter1: For
      await governor.connect(voter1).castVote(proposalId!, 1);
      console.log("✓ Voter 1 voted FOR");

      // voter2: For
      await governor.connect(voter2).castVote(proposalId!, 1);
      console.log("✓ Voter 2 voted FOR");

      // voter3: Against
      await governor.connect(voter3).castVote(proposalId!, 0);
      console.log("✓ Voter 3 voted AGAINST");

      // Check proposal state
      expect(await governor.state(proposalId!)).to.equal(1); // Active

      // 4. Wait for voting period to end
      await mine(VOTING_PERIOD);

      // Check proposal succeeded
      expect(await governor.state(proposalId!)).to.equal(4); // Succeeded
      console.log("✓ Proposal succeeded");

      // 5. Queue proposal
      const descriptionHash = ethers.id("Proposal #1: Set value to 42");

      await governor
        .connect(proposer)
        .queue(
          [await mockTarget.getAddress()],
          [0],
          [encodedFunctionCall],
          descriptionHash
        );

      expect(await governor.state(proposalId!)).to.equal(5); // Queued
      console.log("✓ Proposal queued");

      // 6. Wait for timelock delay
      await time.increase(MIN_DELAY + 1);

      // 7. Execute proposal
      await governor
        .connect(proposer)
        .execute(
          [await mockTarget.getAddress()],
          [0],
          [encodedFunctionCall],
          descriptionHash
        );

      expect(await governor.state(proposalId!)).to.equal(7); // Executed
      console.log("✓ Proposal executed");

      // 8. Verify result
      expect(await mockTarget.getValue()).to.equal(newValue);
      console.log("✓ Target value updated correctly");
    });

    it("Should reject proposal with insufficient votes", async function () {
      // Create proposal
      const encodedFunctionCall = mockTarget.interface.encodeFunctionData(
        "setValue",
        [100]
      );

      const proposeTx = await governor
        .connect(proposer)
        .propose(
          [await mockTarget.getAddress()],
          [0],
          [encodedFunctionCall],
          "Proposal #2: Should fail"
        );

      const proposeReceipt = await proposeTx.wait();
      const proposalCreatedEvent = proposeReceipt?.logs.find((log) => {
        try {
          const parsed = governor.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });
          return parsed?.name === "ProposalCreated";
        } catch {
          return false;
        }
      });

      const parsedEvent = governor.interface.parseLog({
        topics: proposalCreatedEvent!.topics as string[],
        data: proposalCreatedEvent!.data,
      });
      const proposalId = parsedEvent?.args?.proposalId;

      await mine(VOTING_DELAY + 1);

      // Only one voter votes FOR (not enough for quorum)
      await governor.connect(voter1).castVote(proposalId!, 1);

      // Wait for voting period
      await mine(VOTING_PERIOD);

      // Proposal should be defeated
      expect(await governor.state(proposalId!)).to.equal(3); // Defeated
    });
  });

  describe("Voting Mechanisms", function () {
    it("Should prevent double voting", async function () {
      const encodedFunctionCall = mockTarget.interface.encodeFunctionData(
        "setValue",
        [50]
      );

      const proposeTx = await governor
        .connect(proposer)
        .propose(
          [await mockTarget.getAddress()],
          [0],
          [encodedFunctionCall],
          "Test Proposal"
        );

      const proposeReceipt = await proposeTx.wait();
      const proposalCreatedEvent = proposeReceipt?.logs.find((log) => {
        try {
          const parsed = governor.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });
          return parsed?.name === "ProposalCreated";
        } catch {
          return false;
        }
      });

      const parsedEvent = governor.interface.parseLog({
        topics: proposalCreatedEvent!.topics as string[],
        data: proposalCreatedEvent!.data,
      });
      const proposalId = parsedEvent?.args?.proposalId;

      await mine(VOTING_DELAY + 1);

      await governor.connect(voter1).castVote(proposalId!, 1);

      await expect(
        governor.connect(voter1).castVote(proposalId!, 1)
      ).to.be.revertedWithCustomError(governor, "GovernorAlreadyCastVote");
    });

    it("Should support voting with reason", async function () {
      const encodedFunctionCall = mockTarget.interface.encodeFunctionData(
        "setValue",
        [75]
      );

      const proposeTx = await governor
        .connect(proposer)
        .propose(
          [await mockTarget.getAddress()],
          [0],
          [encodedFunctionCall],
          "Test Proposal with Reason"
        );

      const proposeReceipt = await proposeTx.wait();
      const proposalCreatedEvent = proposeReceipt?.logs.find((log) => {
        try {
          const parsed = governor.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });
          return parsed?.name === "ProposalCreated";
        } catch {
          return false;
        }
      });

      const parsedEvent = governor.interface.parseLog({
        topics: proposalCreatedEvent!.topics as string[],
        data: proposalCreatedEvent!.data,
      });
      const proposalId = parsedEvent?.args?.proposalId;

      await mine(VOTING_DELAY + 1);

      const reason = "I support this proposal because...";
      const voteTx = await governor
        .connect(voter1)
        .castVoteWithReason(proposalId!, 1, reason);

      const voteReceipt = await voteTx.wait();

      // Check that VoteCast event was emitted
      const voteEvent = voteReceipt?.logs.find((log) => {
        try {
          const parsed = governor.interface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });
          return parsed?.name === "VoteCast";
        } catch {
          return false;
        }
      });
      expect(voteEvent).to.not.be.undefined;
    });
  });
});
