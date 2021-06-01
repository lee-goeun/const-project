// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract KaiAdmin {

    bool public setOperatorParam = false;
    bool public setEmitParam = false;

    address public sendRewardUser;
    address public factory;
    
    uint public borrowAmount = 0;
    uint public MAX_MINING_POOL_COUNT = 300;

    function canTransferable(address _user, address _contract, uint _amount) public view returns(bool) {
        return true;
    }

    function operatorApprovals(address _user, address _contract) public view returns(bool) {
        return true;
    }

    function setOperatorApproval(address _user, bool _valid) public {
        setOperatorParam = true;
    }

    function borrowBalance(address _user) public view returns(uint) {
        return borrowAmount;
    }

    function setBorrowBalance(uint _amount) public {
        borrowAmount = _amount;
    }

    function emitUserStat(address _user) public {
        setEmitParam = true;
    }

}