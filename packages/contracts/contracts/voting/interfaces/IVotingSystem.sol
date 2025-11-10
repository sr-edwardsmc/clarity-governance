// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVotingSystem {

    struct Poll {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool finalized;
        uint256 totalVotes;
    }

    struct Option {
        string description;
        uint256 voteCount;
    }

    event PollCreated(
        uint256 indexed pollId,
        address indexed creator,
        string title,
        uint256 startTime,
        uint256 endTime
    );

    event VoteCast(
        uint256 indexed pollId,
        address indexed voter,
        uint256 optionId,
        uint256 weight
    );

    event PollFinalized(
        uint256 indexed pollId,
        uint256 winningOptionId
    );

    // Errors
    error PollNotFound();
    error OptionNotFound();
    error PollNotActive();
    error PollAlreadyFinalized();
    error Unauthorized();
    error AlreadyVoted();
    error InvalidOption();
    error InvalidTimeframe();
    error NoVotingPower();


    // Functions
    function createPoll(
        string calldata title,
        string calldata description,
        string[] calldata options,
        uint256 duration
    ) external returns (uint256 pollId);

    function vote(
        uint256 pollId,
        uint256 optionId,
        uint256 weight
    ) external;

    function finalizePoll(uint256 pollId) external;

    function getPoll(uint256 pollId) external view returns (Poll memory);

    function getPollOptions(uint256 pollId) external view returns (Option[] memory);

    function hasVoted(uint256 pollId, address voter) external view returns (bool);

    function getVotingPower(address voter) external view returns (uint256);
}