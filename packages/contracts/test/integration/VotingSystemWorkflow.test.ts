import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { GovernanceToken } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("VotingSystem Integration", function () {
  let votingSystem: any;
  let token: GovernanceToken;
  let owner: HardhatEthersSigner;
  let voter1: HardhatEthersSigner;
  let voter2: HardhatEthersSigner;
  let voter3: HardhatEthersSigner;
  let voter4: HardhatEthersSigner;

  const POLL_DURATION = 7200; // 2 hours

  beforeEach(async function () {
    [owner, voter1, voter2, voter3, voter4] = await ethers.getSigners();

    // Deploy GovernanceToken
    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    token = await GovernanceToken.deploy(owner.address);
    await token.waitForDeployment();

    // Deploy VotingSystem
    const VotingSystem = await ethers.getContractFactory("VotingSystem");
    votingSystem = await VotingSystem.deploy(await token.getAddress());
    await votingSystem.waitForDeployment();

    // Distribute tokens for voting power
    await token.transfer(voter1.address, ethers.parseEther("5000"));
    await token.transfer(voter2.address, ethers.parseEther("3000"));
    await token.transfer(voter3.address, ethers.parseEther("2000"));
    await token.transfer(voter4.address, ethers.parseEther("1000"));
  });

  describe("Complete Poll Lifecycle", function () {
    it("Should complete a full poll cycle with votes and finalization", async function () {
      // 1. Create Poll
      const pollTitle = "Community Decision: Choose Project Direction";
      const pollDescription = "Select the direction for our next development phase";
      const options = [
        "Focus on DeFi features",
        "Expand NFT marketplace",
        "Build social features",
      ];

      const createTx = await votingSystem
        .connect(owner)
        .createPoll(pollTitle, pollDescription, options, POLL_DURATION);

      await expect(createTx).to.emit(votingSystem, "PollCreated");
      console.log("✓ Poll created successfully");

      const pollId = 0;

      // 2. Verify poll is active
      expect(await votingSystem.isPollActive(pollId)).to.be.true;
      console.log("✓ Poll is active");

      // 3. Multiple voters cast votes
      await votingSystem.connect(voter1).vote(pollId, 0, 1); // 5000 votes to option 0
      console.log("✓ Voter 1 voted for option 0");

      await votingSystem.connect(voter2).vote(pollId, 1, 1); // 3000 votes to option 1
      console.log("✓ Voter 2 voted for option 1");

      await votingSystem.connect(voter3).vote(pollId, 0, 1); // 2000 votes to option 0
      console.log("✓ Voter 3 voted for option 0");

      await votingSystem.connect(voter4).vote(pollId, 2, 1); // 1000 votes to option 2
      console.log("✓ Voter 4 voted for option 2");

      // 4. Verify vote counts
      const pollOptions = await votingSystem.getPollOptions(pollId);
      expect(pollOptions[0].voteCount).to.equal(ethers.parseEther("7000")); // voter1 + voter3
      expect(pollOptions[1].voteCount).to.equal(ethers.parseEther("3000")); // voter2
      expect(pollOptions[2].voteCount).to.equal(ethers.parseEther("1000")); // voter4
      console.log("✓ Vote counts are correct");

      // 5. Verify total votes
      const poll = await votingSystem.getPoll(pollId);
      expect(poll.totalVotes).to.equal(ethers.parseEther("11000"));
      console.log("✓ Total votes calculated correctly");

      // 6. Verify voters are marked as having voted
      expect(await votingSystem.hasVoted(pollId, voter1.address)).to.be.true;
      expect(await votingSystem.hasVoted(pollId, voter2.address)).to.be.true;
      expect(await votingSystem.hasVoted(pollId, voter3.address)).to.be.true;
      expect(await votingSystem.hasVoted(pollId, voter4.address)).to.be.true;

      // 7. Advance time past poll end
      await time.increase(POLL_DURATION + 1);
      console.log("✓ Time advanced past poll end");

      // 8. Verify poll is no longer active
      expect(await votingSystem.isPollActive(pollId)).to.be.false;

      // 9. Finalize poll
      const finalizeTx = await votingSystem.finalizePoll(pollId);
      await expect(finalizeTx).to.emit(votingSystem, "PollFinalized");
      console.log("✓ Poll finalized");

      // 10. Verify winner
      const [winningOptionId, voteCount] = await votingSystem.getWinningOption(pollId);
      expect(winningOptionId).to.equal(0); // Option 0 should win with 7000 votes
      expect(voteCount).to.equal(ethers.parseEther("7000"));
      console.log(`✓ Winning option: ${winningOptionId} with ${ethers.formatEther(voteCount)} votes`);

      // 11. Verify poll is marked as finalized
      const finalPoll = await votingSystem.getPoll(pollId);
      expect(finalPoll.finalized).to.be.true;
      console.log("✓ Poll marked as finalized");
    });

    it("Should handle close poll results correctly", async function () {
      const options = ["Option A", "Option B"];

      await votingSystem.createPoll(
        "Close Vote",
        "Testing close results",
        options,
        POLL_DURATION
      );

      // Create a very close vote
      await votingSystem.connect(voter1).vote(0, 0, 1); // 5000 votes
      await votingSystem.connect(voter2).vote(0, 1, 1); // 3000 votes
      await votingSystem.connect(voter3).vote(0, 1, 1); // 2000 votes
      // Total: Option 0: 5000, Option 1: 5000

      const pollOptions = await votingSystem.getPollOptions(0);
      expect(pollOptions[0].voteCount).to.equal(ethers.parseEther("5000"));
      expect(pollOptions[1].voteCount).to.equal(ethers.parseEther("5000"));

      await time.increase(POLL_DURATION + 1);
      await votingSystem.finalizePoll(0);

      const [winningOptionId, voteCount] = await votingSystem.getWinningOption(0);
      expect(voteCount).to.equal(ethers.parseEther("5000"));
      console.log(`✓ In tie, winner is option ${winningOptionId}`);
    });
  });

  describe("Multiple Concurrent Polls", function () {
    it("Should handle multiple active polls independently", async function () {
      // Create three different polls
      await votingSystem.createPoll(
        "Poll 1",
        "Description 1",
        ["A", "B"],
        POLL_DURATION
      );

      await votingSystem.createPoll(
        "Poll 2",
        "Description 2",
        ["X", "Y", "Z"],
        POLL_DURATION
      );

      await votingSystem.createPoll(
        "Poll 3",
        "Description 3",
        ["Red", "Blue", "Green", "Yellow"],
        POLL_DURATION
      );

      expect(await votingSystem.pollCount()).to.equal(3);

      // Vote in different polls
      await votingSystem.connect(voter1).vote(0, 0, 1);
      await votingSystem.connect(voter1).vote(1, 2, 1);
      await votingSystem.connect(voter1).vote(2, 1, 1);

      await votingSystem.connect(voter2).vote(0, 1, 1);
      await votingSystem.connect(voter2).vote(1, 0, 1);
      await votingSystem.connect(voter2).vote(2, 1, 1);

      // Verify independent vote tracking
      expect(await votingSystem.hasVoted(0, voter1.address)).to.be.true;
      expect(await votingSystem.hasVoted(1, voter1.address)).to.be.true;
      expect(await votingSystem.hasVoted(2, voter1.address)).to.be.true;

      expect(await votingSystem.getVoterChoice(0, voter1.address)).to.equal(0);
      expect(await votingSystem.getVoterChoice(1, voter1.address)).to.equal(2);
      expect(await votingSystem.getVoterChoice(2, voter1.address)).to.equal(1);

      console.log("✓ Multiple polls tracked independently");
    });

    it("Should allow voting in different polls at different times", async function () {
      // Create poll 1
      await votingSystem.createPoll("Early Poll", "Desc", ["A", "B"], 3600);
      await votingSystem.connect(voter1).vote(0, 0, 1);

      // Advance time
      await time.increase(1800);

      // Create poll 2
      await votingSystem.createPoll("Later Poll", "Desc", ["X", "Y"], 3600);
      await votingSystem.connect(voter1).vote(1, 1, 1);

      // Poll 1 should still be active
      expect(await votingSystem.isPollActive(0)).to.be.true;
      expect(await votingSystem.isPollActive(1)).to.be.true;

      // Advance time to end poll 1 but not poll 2
      await time.increase(2000);

      expect(await votingSystem.isPollActive(0)).to.be.false;
      expect(await votingSystem.isPollActive(1)).to.be.true;

      // Can finalize poll 1 but not poll 2
      await votingSystem.finalizePoll(0);
      await expect(votingSystem.finalizePoll(1)).to.be.revertedWithCustomError(
        votingSystem,
        "PollNotActive"
      );

      console.log("✓ Different poll timelines handled correctly");
    });
  });

  describe("Weighted Voting", function () {
    it("Should correctly apply different weights to votes", async function () {
      await votingSystem.createPoll(
        "Weighted Vote",
        "Testing weights",
        ["A", "B"],
        POLL_DURATION
      );

      const voter1Power = await token.balanceOf(voter1.address);
      const weight1 = 2;
      const weight2 = 5;

      await votingSystem.connect(voter1).vote(0, 0, weight1);
      await votingSystem.connect(voter2).vote(0, 1, weight2);

      const pollOptions = await votingSystem.getPollOptions(0);
      const voter2Power = await token.balanceOf(voter2.address);

      expect(pollOptions[0].voteCount).to.equal(voter1Power * BigInt(weight1));
      expect(pollOptions[1].voteCount).to.equal(voter2Power * BigInt(weight2));

      console.log("✓ Vote weights applied correctly");
    });

    it("Should handle scenario where weight makes smaller holder win", async function () {
      await votingSystem.createPoll(
        "Weight Victory",
        "Weights matter",
        ["A", "B"],
        POLL_DURATION
      );

      // voter4 has least tokens but uses high weight
      await votingSystem.connect(voter4).vote(0, 0, 10);
      // voter1 has most tokens but uses weight of 1
      await votingSystem.connect(voter1).vote(0, 1, 1);

      const pollOptions = await votingSystem.getPollOptions(0);

      const voter4Votes = (await token.balanceOf(voter4.address)) * BigInt(10);
      const voter1Votes = await token.balanceOf(voter1.address);

      expect(pollOptions[0].voteCount).to.equal(voter4Votes);
      expect(pollOptions[1].voteCount).to.equal(voter1Votes);

      // voter4's weighted vote should be higher
      expect(voter4Votes).to.be.gt(voter1Votes);

      console.log("✓ Weight can overcome token difference");
    });
  });

  describe("Emergency Scenarios", function () {
    it("Should allow pausing all operations during emergency", async function () {
      await votingSystem.createPoll(
        "Pre-pause Poll",
        "Created before pause",
        ["A", "B"],
        POLL_DURATION
      );

      // Vote before pause
      await votingSystem.connect(voter1).vote(0, 0, 1);

      // Owner pauses the contract
      await votingSystem.pause();
      console.log("✓ Contract paused");

      // Cannot create new polls
      await expect(
        votingSystem.createPoll("Paused Poll", "Should fail", ["A", "B"], POLL_DURATION)
      ).to.be.revertedWithCustomError(votingSystem, "EnforcedPause");

      // Cannot vote
      await expect(
        votingSystem.connect(voter2).vote(0, 1, 1)
      ).to.be.revertedWithCustomError(votingSystem, "EnforcedPause");

      // Can still read data
      const poll = await votingSystem.getPoll(0);
      expect(poll.title).to.equal("Pre-pause Poll");

      // Unpause
      await votingSystem.unpause();
      console.log("✓ Contract unpaused");

      // Operations work again
      await votingSystem.connect(voter2).vote(0, 1, 1);
      expect(await votingSystem.hasVoted(0, voter2.address)).to.be.true;

      console.log("✓ Emergency pause/unpause works correctly");
    });

    it("Should finalize polls even after pause", async function () {
      await votingSystem.createPoll("Test", "Test", ["A", "B"], POLL_DURATION);
      await votingSystem.connect(voter1).vote(0, 0, 1);

      await time.increase(POLL_DURATION + 1);

      // Pause doesn't affect finalization
      await votingSystem.pause();
      await expect(votingSystem.finalizePoll(0)).to.not.be.reverted;

      console.log("✓ Can finalize polls while paused");
    });
  });

  describe("Token Balance Changes", function () {
    it("Should use current balance for voting power", async function () {
      await votingSystem.createPoll(
        "Balance Test",
        "Testing balance changes",
        ["A", "B"],
        POLL_DURATION
      );

      const initialBalance = await token.balanceOf(voter1.address);

      // Transfer some tokens away before voting
      await token.connect(voter1).transfer(voter4.address, ethers.parseEther("1000"));

      const newBalance = await token.balanceOf(voter1.address);
      expect(newBalance).to.be.lt(initialBalance);

      // Vote with reduced balance
      await votingSystem.connect(voter1).vote(0, 0, 1);

      const pollOptions = await votingSystem.getPollOptions(0);
      expect(pollOptions[0].voteCount).to.equal(newBalance);

      console.log("✓ Voting power reflects current balance");
    });

    it("Should snapshot voting power at time of vote", async function () {
      await votingSystem.createPoll("Snapshot Test", "Test", ["A", "B"], POLL_DURATION);

      await votingSystem.connect(voter1).vote(0, 0, 1);
      const pollOptionsAfterVote = await votingSystem.getPollOptions(0);
      const voteCountAfterVote = pollOptionsAfterVote[0].voteCount;

      // Transfer tokens after voting
      await token.connect(voter1).transfer(voter4.address, ethers.parseEther("2000"));

      // Vote count should not change
      const pollOptionsAfterTransfer = await votingSystem.getPollOptions(0);
      expect(pollOptionsAfterTransfer[0].voteCount).to.equal(voteCountAfterVote);

      console.log("✓ Vote count locked at time of voting");
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("Should handle poll with no votes", async function () {
      await votingSystem.createPoll("No Votes", "Empty poll", ["A", "B"], POLL_DURATION);

      await time.increase(POLL_DURATION + 1);
      await votingSystem.finalizePoll(0);

      const [winningOptionId, voteCount] = await votingSystem.getWinningOption(0);
      expect(voteCount).to.equal(0);
      console.log("✓ Empty poll handled correctly");
    });

    it("Should handle maximum number of options", async function () {
      const maxOptions = Array(10)
        .fill(0)
        .map((_, i) => `Option ${i + 1}`);

      await votingSystem.createPoll("Max Options", "Test", maxOptions, POLL_DURATION);

      // Vote for last option
      await votingSystem.connect(voter1).vote(0, 9, 1);

      expect(await votingSystem.getVoterChoice(0, voter1.address)).to.equal(9);
      console.log("✓ Maximum options handled correctly");
    });

    it("Should prevent voting after emergency pause during active poll", async function () {
      await votingSystem.createPoll("Emergency Test", "Test", ["A", "B"], POLL_DURATION);

      await votingSystem.connect(voter1).vote(0, 0, 1);

      // Emergency pause mid-poll
      await votingSystem.pause();

      await expect(
        votingSystem.connect(voter2).vote(0, 1, 1)
      ).to.be.revertedWithCustomError(votingSystem, "EnforcedPause");

      console.log("✓ Pause prevents new votes");
    });

    it("Should maintain vote history across multiple polls", async function () {
      // Create and complete first poll
      await votingSystem.createPoll("Poll 1", "First", ["A", "B"], 3600);
      await votingSystem.connect(voter1).vote(0, 0, 1);
      await time.increase(3601);
      await votingSystem.finalizePoll(0);

      // Create and vote in second poll
      await votingSystem.createPoll("Poll 2", "Second", ["X", "Y"], 3600);
      await votingSystem.connect(voter1).vote(1, 1, 1);

      // Verify history is maintained
      expect(await votingSystem.hasVoted(0, voter1.address)).to.be.true;
      expect(await votingSystem.hasVoted(1, voter1.address)).to.be.true;
      expect(await votingSystem.getVoterChoice(0, voter1.address)).to.equal(0);
      expect(await votingSystem.getVoterChoice(1, voter1.address)).to.equal(1);

      console.log("✓ Vote history maintained across polls");
    });
  });
});
