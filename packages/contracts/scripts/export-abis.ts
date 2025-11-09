import * as fs from "fs";
import * as path from "path";

const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");
const outputDir = path.join(__dirname, "../../frontend/src", "lib", "abis");

const contracts = [
  { name: "GovernanceToken", path: "/governance/GovernanceToken.sol" },
  { name: "GovernorContract", path: "/governance/Governor.sol" },
  { name: "MockTarget", path: "/mocks/MockTarget.sol" },
];

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Export ABIs

contracts.forEach(({ name, path: contractPath }) => {
  const artifactPath = path.join(artifactsDir, contractPath, `${name}.json`);
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

  const abi = {
    abi: artifact.abi,
    contractName: name,
  };

  const outputPath = path.join(outputDir, `${name}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(abi, null, 2));
  console.log(`Exported ABI for ${name} to ${outputPath}`);
});

console.log(`\n📁 ABIs saved to: ${outputDir}`);
