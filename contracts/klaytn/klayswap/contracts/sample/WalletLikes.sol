// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract WalletLikes {

    bool public claimKSPParam = false;
    bool public claimTokenParam = false;

    address public sendRewardUser;
    address public factory;
    
    uint public sendRewardAmount = 0;
    uint public MAX_MINING_POOL_COUNT = 300;

    function claimKSP(address _user) public view returns (uint) {
        return 1000;
    }

    function claimToken(address _user, address _token) public view returns (uint) {
        return 1000;
    }

}