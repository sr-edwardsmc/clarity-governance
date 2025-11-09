# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clarity Governance is a Web3 governance DApp built on Ethereum that demonstrates transparent on-chain governance. The project is structured as a monorepo with two main packages:

- **packages/contracts**: Smart contracts using both Hardhat and Foundry
- **packages/ui**: Next.js frontend with RainbowKit wallet integration

## Architecture

### Smart Contracts (`packages/contracts`)

The project implements a full governance system based on OpenZeppelin's Governor framework:

1. **GovernanceToken** (`contracts/governance/GovernanceToken.sol`)
   - ERC20 token with voting capabilities (ERC20Votes)
   - Supports vote delegation and checkpoint tracking
   - EIP-712 permit support for gasless approvals
   - Initial supply: 100 million tokens

2. **Governor** (`contracts/governance/Governor.sol`)
   - Main governance contract implementing OpenZeppelin Governor extensions
   - Voting delay: 1 day (7200 blocks)
   - Voting period: 1 week (50400 blocks)
   - Proposal threshold: 1000 tokens
   - Quorum: 4% of total supply
   - Integrated with TimelockController for execution delays

3. **Development Tooling**
   - **Dual Framework Setup**: Uses both Hardhat and Foundry
   - Hardhat: Primary for deployment scripts, TypeScript tests, and network configuration
   - Foundry: Source files in `src/`, tests can use Forge
   - Foundry remappings configured for OpenZeppelin imports

### Frontend (`packages/ui`)

- **Framework**: Next.js 16 with App Router
- **Web3 Integration**:
  - RainbowKit for wallet connection
  - wagmi v2 for contract interactions
  - viem for Ethereum utilities
- **Styling**: Tailwind CSS v4
- **Linting/Formatting**: Biome

## Development Commands

### Contracts Package

Navigate to `packages/contracts` for all contract commands:

```bash
cd packages/contracts
```

**Compilation:**
```bash
npx hardhat compile          # Compile contracts with Hardhat
forge build                  # Compile with Foundry
```

**Testing:**
```bash
npx hardhat test                                    # Run all tests
npx hardhat test test/unit/GovernanceToken.test.ts  # Run specific test
npx hardhat test --grep "should mint initial"       # Run tests matching pattern
forge test                                           # Run Foundry tests
```

**Test Organization:**
- `test/unit/`: Unit tests for individual contracts (Hardhat TypeScript)
- `test/integration/`: End-to-end workflow tests (Hardhat TypeScript)
- `test/security/`: Security-focused tests

**Coverage:**
```bash
npx hardhat coverage         # Generate coverage report
```

**Gas Reporting:**
```bash
REPORT_GAS=true npx hardhat test
```

**Deployment:**
```bash
npx hardhat run scripts/deploy.ts --network hardhat    # Local deployment
npx hardhat run scripts/deploy.ts --network sepolia    # Testnet deployment
```

**Local Node:**
```bash
npx hardhat node             # Start local Ethereum node
```

**Contract Verification:**
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

**Other Utilities:**
```bash
npx hardhat size-contracts   # Check contract sizes
npx hardhat clean            # Clear cache and artifacts
```

### UI Package

Navigate to `packages/ui` for frontend commands:

```bash
cd packages/ui
```

**Development:**
```bash
pnpm dev                     # Start dev server (localhost:3000)
pnpm build                   # Build for production
pnpm start                   # Start production server
```

**Code Quality:**
```bash
pnpm lint                    # Run Biome checks
pnpm format                  # Format code with Biome
```

### Root Level

The root package.json currently has minimal scripts. Use pnpm as the package manager (version 10.20.0).

## Environment Variables

### Contracts Package

Create `packages/contracts/.env`:

```env
DEPLOYER_PRIVATE_KEY=        # 66-char private key (with 0x prefix)
SEPOLIA_RPC_URL=             # Ethereum Sepolia RPC endpoint
MAINNET_RPC_URL=             # Ethereum Mainnet RPC endpoint
ETHERSCAN_API_KEY=           # For contract verification
COINMARKETCAP_API_KEY=       # For gas reporter (optional)
REPORT_GAS=true              # Enable gas reporting (optional)
```

### UI Package

Create `packages/ui/.env.local` for Next.js environment variables.

## Key Implementation Details

### Governance Flow

1. **Token Distribution**: GovernanceToken must be distributed to participants
2. **Delegation**: Users must delegate voting power (can self-delegate)
3. **Proposal Creation**: Users with ≥1000 tokens can create proposals
4. **Voting**: Active for 1 week after 1-day delay
5. **Execution**: Successful proposals queued in timelock, executed after delay

### Testing Strategy

- Unit tests verify individual contract behavior
- Integration tests (`GovernanceWorkflow.test.ts`) verify complete governance lifecycle
- Use Hardhat's time manipulation helpers for testing timelock and voting periods

### Network Configuration

Configured networks in `hardhat.config.ts`:
- `hardhat`: Local development (chainId 31337)
- `sepolia`: Ethereum testnet (chainId 11155111)
- `mainnet`: Ethereum mainnet (chainId 1)

### Contract Size Monitoring

Contract sizer runs automatically on compile. Keep contracts under 24KB to avoid deployment issues.

## Important Notes

- This is a governance DApp focused on transparency
- Uses OpenZeppelin's audited contracts as foundation
- Solidity version: 0.8.20
- **Ethers.js version: 6.x** (uses modern ethers6 API)
- Foundry source directory is `src/`, separate from Hardhat's `contracts/`
- Tests are primarily in TypeScript using Hardhat framework

## Ethers.js v6 Key Differences

When writing code for this project, use ethers6 syntax:

- `ethers.parseEther()` instead of `ethers.utils.parseEther()`
- `ethers.formatEther()` instead of `ethers.utils.formatEther()`
- `ethers.keccak256()` instead of `ethers.utils.keccak256()`
- `ethers.toUtf8Bytes()` instead of `ethers.utils.toUtf8Bytes()`
- `ethers.id()` for hashing strings (replaces `ethers.utils.keccak256(ethers.utils.toUtf8Bytes())`)
- `await contract.waitForDeployment()` instead of `await contract.deployed()`
- `await contract.getAddress()` instead of `contract.address`
- `ethers.ZeroAddress` instead of `ethers.constants.AddressZero`
- `ethers.provider` instead of `signer.provider`
- `ethers.Signature.from(signature)` instead of `ethers.utils.splitSignature(signature)`
- `signer.signTypedData()` instead of `signer._signTypedData()`
- Native JavaScript `BigInt` support (can use `123n` or convert with `BigInt()`)
