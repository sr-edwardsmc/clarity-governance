// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockTarget
 * @notice Mock contract to test governance proposals
 * @dev Used for testing proposal execution
 */
contract MockTarget {
    uint256 public value;
    string public message;
    
    event ValueChanged(uint256 newValue);
    event MessageChanged(string newMessage);
    
    function setValue(uint256 _value) external {
        value = _value;
        emit ValueChanged(_value);
    }
    
    function setMessage(string memory _message) external {
        message = _message;
        emit MessageChanged(_message);
    }
    
    function getValue() external view returns (uint256) {
        return value;
    }
    
    function getMessage() external view returns (string memory) {
        return message;
    }
}