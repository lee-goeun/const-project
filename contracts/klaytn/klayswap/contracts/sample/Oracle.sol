// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract Oracle {

    bool public sendRewardParam = false;

    address public sendRewardUser;
    address public factory;
    
    uint public sendRewardAmount = 0;
    uint public MAX_MINING_POOL_COUNT = 300;

    function getPrice(address _token) public view returns (uint) {
        return 100;
    }



}