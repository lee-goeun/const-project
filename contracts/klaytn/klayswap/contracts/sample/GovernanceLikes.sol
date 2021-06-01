// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract GovernanceLikes {

    bool public sendRewardParam = false;

    address public sendRewardUser;
    address public factory;
    address public poolVoting;

    uint public sendRewardAmount = 0;
    uint public MAX_MINING_POOL_COUNT = 300;
    uint public feeShareRate = 0;

    function sendReward(address _user, uint _amount) public {
        sendRewardParam = true;
        sendRewardUser = _user;
        sendRewardAmount = _amount;
    }

    function setFeeShareRate(uint amount) public {
        feeShareRate = amount;
    }

    function setPoolVoting(address _contract) public {
        poolVoting = _contract;
    }

}