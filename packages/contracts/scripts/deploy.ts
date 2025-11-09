import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log(
    "Account balance:",
    (await ethers.provider.getBalance(deployer.address)).toString()
  );

  // Deploy Governance Token
  console.log("\n1. Deploying Governance Token...");
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const token = await GovernanceToken.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✓ Governance Token deployed to:", tokenAddress);

  // Deploy Timelock
  console.log("\n2. Deploying Timelock Controller...");
  const minDelay = 2 * 24 * 60 * 60; // 2 days
  const proposers: string[] = [];
  const executors: string[] = [];
  const admin = deployer.address;

  const TimelockController = await ethers.getContractFactory(
    "TimelockController"
  );
  const timelock = await TimelockController.deploy(
    minDelay,
    proposers,
    executors,
    admin
  );
  await timelock.waitForDeployment();
  const timelockAddress = await timelock.getAddress();
  console.log("✓ Timelock Controller deployed to:", timelockAddress);

  // Deploy Governor
  console.log("\n3. Deploying Governor Contract...");
  const Governor = await ethers.getContractFactory("GovernorContract");
  const governor = await Governor.deploy(tokenAddress, timelockAddress);
  await governor.waitForDeployment();
  const governorAddress = await governor.getAddress();
  console.log("✓ Governor Contract deployed to:", governorAddress);

  // Setup roles
  console.log("\n4. Setting up roles...");

  const proposerRole = await timelock.PROPOSER_ROLE();
  const executorRole = await timelock.EXECUTOR_ROLE();
  const adminRole = await timelock.DEFAULT_ADMIN_ROLE();

  // Grant proposer role to governor
  let tx = await timelock.grantRole(proposerRole, governorAddress);
  await tx.wait();
  console.log("✓ Granted PROPOSER_ROLE to Governor");

  // Grant executor role to everyone (address(0))
  tx = await timelock.grantRole(executorRole, ethers.ZeroAddress);
  await tx.wait();
  console.log("✓ Granted EXECUTOR_ROLE to everyone");

  // Revoke admin role from deployer
  tx = await timelock.revokeRole(adminRole, deployer.address);
  await tx.wait();
  console.log("✓ Revoked ADMIN_ROLE from deployer");

  // Deploy Mock Target (for testing)
  console.log("\n5. Deploying Mock Target...");
  const MockTarget = await ethers.getContractFactory("MockTarget");
  const mockTarget = await MockTarget.deploy();
  await mockTarget.waitForDeployment();
  const mockTargetAddress = await mockTarget.getAddress();
  console.log("✓ Mock Target deployed to:", mockTargetAddress);

  // Transfer ownership to timelock
  console.log("\n6. Transferring ownership to Timelock...");
  tx = await token.transferOwnership(timelockAddress);
  await tx.wait();
  console.log("✓ Transferred token ownership to Timelock");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Governance Token:", tokenAddress);
  console.log("Timelock Controller:", timelockAddress);
  console.log("Governor Contract:", governorAddress);
  console.log("Mock Target:", mockTargetAddress);
  console.log("=".repeat(60));

  // Save deployment addresses
  const fs = require("fs");
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    contracts: {
      governanceToken: tokenAddress,
      timelock: timelockAddress,
      governor: governorAddress,
      mockTarget: mockTargetAddress,
    },
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployment-addresses.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n✓ Deployment addresses saved to deployment-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
