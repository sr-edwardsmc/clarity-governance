import { ethers } from "hardhat";
import * as fs from "fs";

async function main() {
  const deployment = JSON.parse(
    fs.readFileSync("deployment-addresses.json", "utf-8")
  );

  console.log("\n🔍 Verifying Deployment...\n");

  const token = await ethers.getContractAt(
    "GovernanceToken",
    deployment.contracts.governanceToken
  );

  const governor = await ethers.getContractAt(
    "GovernorContract",
    deployment.contracts.governor
  );

  const timelock = await ethers.getContractAt(
    "TimelockController",
    deployment.contracts.timelock
  );

  // Verify Token
  console.log("✅ Token Name:", await token.name());
  console.log("✅ Token Symbol:", await token.symbol());
  console.log(
    "✅ Total Supply:",
    ethers.formatEther(await token.totalSupply())
  );

  // Verify Governor
  console.log("✅ Governor Name:", await governor.name());
  console.log("✅ Token Address:", await governor.token());
  console.log("✅ Timelock Address:", await governor.timelock());

  // Verify Timelock
  const minDelay = await timelock.getMinDelay();
  console.log("✅ Min Delay:", minDelay.toString(), "seconds");

  console.log("\n🎉 All contracts verified successfully!\n");
}

main().catch(console.error);
