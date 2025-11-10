// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GovernanceToken
 * @author Edward Monsalve Castrillon
 * @notice ERC20 token with voting and delegation capabilities
 * @dev Extends ERC20Votes for on-chain governance
 * 
 * Key Features:
 * - Vote delegation with checkpoint tracking
 * - EIP-712 permit support for gasless approvals
 * - Initial supply minting to deployer
 * 
 * Security Considerations:
 * - Uses OpenZeppelin's audited contracts
 * - Implements ERC20Votes for secure vote tracking
 * - Prevents double voting through checkpoint system
 */
contract GovernanceToken is ERC20, ERC20Permit, ERC20Votes, Ownable {
    
    /// @notice Initial token supply (100 million tokens)
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10**18;
    
    /**
     * @notice Contract constructor
     * @param initialOwner Address that will receive initial supply
     */
    constructor(address initialOwner)
        ERC20("Clarity Governance Token", "CLTY")
        ERC20Permit("Clarity Governance Token")
        Ownable(initialOwner)
    {
        _mint(initialOwner, INITIAL_SUPPLY);
    }
    
    /**
     * @notice Mints new tokens (only owner can call)
     * @param to Address to receive minted tokens
     * @param amount Amount of tokens to mint
     * @dev Should be controlled by governance after deployment
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    // The following functions are overrides required by Solidity
    
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, value);
    }
    
    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}