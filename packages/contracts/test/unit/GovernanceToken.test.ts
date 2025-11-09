import { expect } from "chai";
import { ethers } from "hardhat";
import { GovernanceToken } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("GovernanceToken", function () {
  let token: GovernanceToken;
  let owner: HardhatEthersSigner;
  let addr1: HardhatEthersSigner;
  let addr2: HardhatEthersSigner;

  const INITIAL_SUPPLY = ethers.parseEther("100000000");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    token = await GovernanceToken.deploy(owner.address);
    await token.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await token.name()).to.equal("Governance Token");
      expect(await token.symbol()).to.equal("GOV");
    });

    it("Should mint initial supply to owner", async function () {
      const balance = await token.balanceOf(owner.address);
      expect(balance).to.equal(INITIAL_SUPPLY);
    });

    it("Should set the correct total supply", async function () {
      expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY);
    });
  });

  describe("Voting Power", function () {
    it("Should have zero voting power without delegation", async function () {
      await token.transfer(addr1.address, ethers.parseEther("1000"));
      expect(await token.getVotes(addr1.address)).to.equal(0);
    });

    it("Should delegate voting power to self", async function () {
      const amount = ethers.parseEther("1000");
      await token.transfer(addr1.address, amount);

      await token.connect(addr1).delegate(addr1.address);
      expect(await token.getVotes(addr1.address)).to.equal(amount);
    });

    it("Should delegate voting power to another address", async function () {
      const amount = ethers.parseEther("1000");
      await token.transfer(addr1.address, amount);

      await token.connect(addr1).delegate(addr2.address);
      expect(await token.getVotes(addr2.address)).to.equal(amount);
      expect(await token.getVotes(addr1.address)).to.equal(0);
    });

    it("Should update voting power on transfer", async function () {
      const amount1 = ethers.parseEther("1000");
      const amount2 = ethers.parseEther("500");

      await token.transfer(addr1.address, amount1);
      await token.connect(addr1).delegate(addr1.address);
      expect(await token.getVotes(addr1.address)).to.equal(amount1);

      await token.connect(addr1).transfer(addr2.address, amount2);
      expect(await token.getVotes(addr1.address)).to.equal(amount1 - amount2);
    });
  });

  describe("Checkpoints", function () {
    it("Should create checkpoints on delegation", async function () {
      const amount = ethers.parseEther("1000");
      await token.transfer(addr1.address, amount);

      await token.connect(addr1).delegate(addr1.address);
      const blockNumber = await ethers.provider.getBlockNumber();

      const pastVotes = await token.getPastVotes(
        addr1.address,
        blockNumber - 1
      );
      expect(pastVotes).to.equal(0);

      const currentVotes = await token.getVotes(addr1.address);
      expect(currentVotes).to.equal(amount);
    });
  });

  describe("ERC20Permit", function () {
    it("Should allow permit-based approvals", async function () {
      const amount = ethers.parseEther("1000");
      const latestBlock = await ethers.provider.getBlock("latest");
      const deadline = latestBlock!.timestamp + 3600;
      const nonce = await token.nonces(owner.address);

      const domain = {
        name: "Governance Token",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await token.getAddress(),
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const value = {
        owner: owner.address,
        spender: addr1.address,
        value: amount,
        nonce: nonce,
        deadline: deadline,
      };

      const signature = await owner.signTypedData(domain, types, value);
      const sig = ethers.Signature.from(signature);

      await token.permit(
        owner.address,
        addr1.address,
        amount,
        deadline,
        sig.v,
        sig.r,
        sig.s
      );

      expect(await token.allowance(owner.address, addr1.address)).to.equal(
        amount
      );
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to mint", async function () {
      const amount = ethers.parseEther("1000");

      await expect(
        token.connect(addr1).mint(addr1.address, amount)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");

      await token.mint(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);
    });
  });
});
