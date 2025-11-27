// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IVotingSystem.sol";

/** 
 * @title VotingSystem
 * @notice A decentralized voting system allowing users to create polls and vote on options.
 * @dev Implements the IVotingSystem interface and includes ownership, reentrancy protection, and pausability.
 *      Implements time-locked polls with multiple options and weighted voting based on token holdings.
 */

contract VotingSystem is IVotingSystem, Ownable, Pausable, ReentrancyGuard {
    // State variables
    IERC20 public immutable votingToken;
    uint256 public pollCount;

    uint256 public constant MIN_POLL_DURATION = 1 hours;
    uint256 public constant MAX_POLL_DURATION = 30 days;
    uint256 public constant MAX_OPTIONS = 10;

    mapping(uint256 => Poll) private polls;
    mapping(uint256 => Option[]) private pollOptions;
    mapping(uint256 => mapping(address => bool)) private hasVotedInPoll;
    mapping(uint256 => mapping(address => uint256)) private voterChoice;


    /**
     * @notice Constructor to initialize the VotingSystem contract.
     * @param _votingToken The address of the ERC20 token used for weighted voting
     */
    constructor(address _votingToken) Ownable(msg.sender) {
        if (_votingToken == address(0)) revert Unauthorized();
        votingToken = IERC20(_votingToken);
    }

    // modifiers
    modifier pollExists(uint256 pollId) {
        if (pollId >= pollCount) {
            revert PollNotFound();
        }
        _;
    }

    modifier pollActive(uint256 pollId) {
        Poll memory poll = polls[pollId];
        if (block.timestamp < poll.startTime || block.timestamp > poll.endTime) {
            revert PollNotActive();
        }
        _;
    }

    /**
     * @notice Creates a new poll with specified options and duration.
     * @param title The title of the poll.
     * @param description The description of the poll.
     * @param options An array of option descriptions for the poll.
     * @param duration The duration of the poll in seconds.
     * @return pollId The ID of the newly created poll.
     */
    function createPoll(
        string calldata title,
        string calldata description,
        string[] calldata options,
        uint256 duration
    ) external whenNotPaused nonReentrant returns (uint256 pollId) {
        // Validate inputs
        if (duration < MIN_POLL_DURATION || duration > MAX_POLL_DURATION) {
            revert InvalidTimeframe();
        }
        if (options.length < 2 || options.length > MAX_OPTIONS) {
            revert InvalidOption();
        }

        // Create poll
        pollId = pollCount++;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + duration;

        polls[pollId] = Poll({
            id: pollId,
            title: title,
            description: description,
            startTime: startTime,
            endTime: endTime,
            finalized: false,
            totalVotes: 0
        });

        // Add options
        for (uint256 i = 0; i < options.length; i++) {
            pollOptions[pollId].push(Option({
                description: options[i],
                voteCount: 0
            }));
        }

        emit PollCreated(pollId, msg.sender, title, startTime, endTime);
    }

    /**
     * @notice Casts a vote for a specific option in a poll.
     * @param pollId The ID of the poll to vote in.
     * @param optionId The ID of the option to vote for.
     * @param weight The weight of the vote based on token holdings.
     */
    function vote(
        uint256 pollId,
        uint256 optionId,
        uint256 weight
    ) external whenNotPaused nonReentrant pollExists(pollId) pollActive(pollId) {
        // Check if the voter has already voted in this poll
        if (hasVotedInPoll[pollId][msg.sender]) {
            revert AlreadyVoted();
        }

        // Validate option
        if (optionId >= pollOptions[pollId].length) {
            revert OptionNotFound();
        }

        // Get voting power
        uint256 votingPower = getVotingPower(msg.sender);
        if (votingPower == 0) revert NoVotingPower();

        // Record the vote
        hasVotedInPoll[pollId][msg.sender] = true;
        voterChoice[pollId][msg.sender] = optionId;
        
        // Update vote counts
        pollOptions[pollId][optionId].voteCount += votingPower * weight;
        polls[pollId].totalVotes += votingPower * weight;

        emit VoteCast(pollId, msg.sender, optionId, votingPower * weight);
    }

    /**
     * @notice Finalizes a poll after its has ended
     * @param pollId The ID of the poll to finalize.
     */
    function finalizePoll(uint256 pollId) external pollExists(pollId) {
        Poll storage poll = polls[pollId];

        if (poll.finalized) revert PollAlreadyFinalized();
        if (block.timestamp <= poll.endTime) revert PollNotActive();

        poll.finalized = true;

        emit PollFinalized(pollId, 0); // Winning option logic can be implemented in derived contracts
    }

    // View functions

    /**
     * @notice Retrieves the details of a specific poll.
     * @param pollId The ID of the poll to retrieve.
     * @return The Poll struct containing poll details.
     */
    function getPoll(uint256 pollId) external view pollExists(pollId) returns (Poll memory) {
        return polls[pollId];
    }

    /**
     * @notice Retrieves the options of a specific poll.
     * @param pollId The ID of the poll to retrieve options for.
     * @return An array of Option structs containing option details.
     */
    function getPollOptions(uint256 pollId) external view pollExists(pollId) returns (Option[] memory) {
        return pollOptions[pollId];
    }

    /**
     * @notice Retrieves the voting power of a specific voter.
     * @param voter The address of the voter.
     * @return The voting power based on token holdings.
     */
    function getVotingPower(address voter) public view virtual returns (uint256) {
        return votingToken.balanceOf(voter);
    }

    /**
     * @notice Checks if a voter has voted in a specific poll.
     * @param pollId The ID of the poll.
     * @param voter The address of the voter.
     * @return True if the voter has voted in the poll, false otherwise.
     */
    function hasVoted(uint256 pollId, address voter) external view pollExists(pollId) returns (bool) {
        return hasVotedInPoll[pollId][voter];
    }

    /**
     * @notice Get the option ID a voter selected in a specific poll.
     * @param pollId The ID of the poll.
     * @param voter The address of the voter.
     * @return The option ID selected by the voter.
     */
    function getVoterChoice(uint256 pollId, address voter) external view pollExists(pollId) returns (uint256) {
        return voterChoice[pollId][voter];
    }

    /**
     * @notice Get the winning option ID of a finalized poll.
     * @param pollId The ID of the poll.
     * @return winningOptionId The winning option ID.
     * @return voteCount The vote count of the winning option.
     */
    function getWinningOption(uint256 pollId) external view pollExists(pollId) returns (uint256 winningOptionId, uint256 voteCount) {
        Poll memory poll = polls[pollId];
        if (!poll.finalized) {
            revert PollNotActive();
        }

        Option[] storage options = pollOptions[pollId];
        uint256 highestVotes = 0;

        for (uint256 i = 0; i < options.length; i++) {
            if (options[i].voteCount > highestVotes) {
                highestVotes = options[i].voteCount;
                winningOptionId = i;
            }
        }

        voteCount = highestVotes;
    }

    /**
     * @notice Check if a poll is currently active.
     * @param pollId The ID of the poll.
     * @return True if the poll is active, false otherwise.
     */
    function isPollActive(uint256 pollId) external view pollExists(pollId) returns (bool) {
        Poll storage poll = polls[pollId];
        return !poll.finalized && 
                block.timestamp >= poll.startTime &&
                block.timestamp <= poll.endTime;
    }

    // Admin functions
    
    /**
     * @notice Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}