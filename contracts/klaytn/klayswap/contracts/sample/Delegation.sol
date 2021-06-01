// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract Delegation {

    address public cnAddress;
    address public stakeTo;

    uint public a = 100;
    uint public b = 200;
    uint public c;
    uint public withdrawHistory;
    uint public depositHistory;
    address public unstakeHistory;
    uint public claimHis;

    function getCnStakingAddress() external view returns (address) {
        return cnAddress;
    }

    function getPoolStat() external view returns (uint, uint) {
        return (a, b);
    }

    function getUserStat(address user) external view returns (uint, uint, uint, uint) {
        return (500, 200, 300, 400);
    }

    function setValue() public {
        a = 400;
        b = 100;
    }

    function depositSKlay(uint sklay) external {
        depositHistory = sklay;
    }

    function withdrawSKlay(uint sklay) external {
        withdrawHistory = sklay;
    }

    function stakeKlay(address to) external payable {
        stakeTo = to;
        c = msg.value;
    }

    function unstakeKlayWithSKlay(address to, uint sklay) external {
        unstakeHistory = to;
    }

    function setCN(address to) public {
        cnAddress = to;
    }
    
    function claimUnstakingKlay(uint uid) external {
        claimHis = uid;
    }

    function setParam(uint _a, uint _b) public {
        a = _a;
        b = _b;
    }

}