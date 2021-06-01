// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract CnStaking {

    address public cnAddress;
    address public stakeTo;


    uint public withdrawHistory;
    uint public depositHistory;
    address public unstakeHistory;

    function getApprovedStakingWithdrawalInfo(uint k) external view returns (uint a, uint b, uint c, uint d) {
        a = 0;
        b = 0;
        c = 0;
        d = k-1;
    }



}