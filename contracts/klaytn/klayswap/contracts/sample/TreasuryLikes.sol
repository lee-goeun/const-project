// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract TreasuryLikes {

    bool public claimParam = false;

    address public sendRewardUser;
    address public factory;
    
    uint public sendRewardAmount = 0;
    uint public MAX_MINING_POOL_COUNT = 300;

    function claim(address _user, address _contract) public {
        claimParam = true;
    }



}