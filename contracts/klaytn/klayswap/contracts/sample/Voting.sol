// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract Voting {

    bool public setMiningParam = false;

    address public govAddress;
    uint public mining = 0;

    function setGovernance(address _gov) public {
        govAddress = _gov;
    }

    function governance() public view returns (address) {
        return govAddress;
    }

    function setMining(uint _rate) public {
        mining = _rate;
        setMiningParam = true;
    }

}