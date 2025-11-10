// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/**
 * @title GovernorContract
 * @author Edward Monsalve Castrillon
 * @notice Main governance contract for proposal creation, voting, and execution
 * @dev Implements OpenZeppelin's Governor with multiple extensions
 * 
 * Voting Parameters:
 * - Voting Delay: 1 day (7200 blocks)
 * - Voting Period: 1 week (50400 blocks)
 * - Proposal Threshold: 1000 tokens
 * - Quorum: 4% of total supply
 * 
 * Proposal Lifecycle:
 * 1. Pending (after creation, before voting delay)
 * 2. Active (voting period)
 * 3. Defeated/Succeeded (after voting period)
 * 4. Queued (successful proposals, waiting timelock)
 * 5. Executed (after timelock delay)
 */
contract GovernorContract is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    /// @notice Voting delay in blocks (1 day with 12s blocks)
    uint48 private constant VOTING_DELAY = 7200;
    
    /// @notice Voting period in blocks (1 week with 12s blocks)
    uint32 private constant VOTING_PERIOD = 50400;
    
    /// @notice Proposal threshold (1000 tokens with 18 decimals)
    uint256 private constant PROPOSAL_THRESHOLD = 1000 * 10**18;
    
    /// @notice Quorum percentage (4% of total supply)
    uint256 private constant QUORUM_PERCENTAGE = 4;
    
    /**
     * @notice Contract constructor
     * @param _token Governance token address (must implement IVotes)
     * @param _timelock Timelock controller address
     */
    constructor(
        IVotes _token,
        TimelockController _timelock
    )
        Governor("GovernorContract")
        GovernorSettings(
            VOTING_DELAY,
            VOTING_PERIOD,
            PROPOSAL_THRESHOLD
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(QUORUM_PERCENTAGE)
        GovernorTimelockControl(_timelock)
    {}
    
    // Override functions required by Solidity
    
    function votingDelay()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }
    
    function votingPeriod()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }
    
    function quorum(uint256 blockNumber)
        public
        view
        override(Governor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }
    
    function state(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }
    
    function proposalNeedsQueuing(uint256 proposalId)
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (bool)
    {
        return super.proposalNeedsQueuing(proposalId);
    }
    
    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }
    
    function _queueOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    )
        internal
        override(Governor, GovernorTimelockControl)
        returns (uint48)
    {
        return super._queueOperations(
            proposalId,
            targets,
            values,
            calldatas,
            descriptionHash
        );
    }
    
    function _executeOperations(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    )
        internal
        override(Governor, GovernorTimelockControl)
    {
        super._executeOperations(
            proposalId,
            targets,
            values,
            calldatas,
            descriptionHash
        );
    }
    
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    )
        internal
        override(Governor, GovernorTimelockControl)
        returns (uint256)
    {
        return super._cancel(
            targets,
            values,
            calldatas,
            descriptionHash
        );
    }
    
    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }
}