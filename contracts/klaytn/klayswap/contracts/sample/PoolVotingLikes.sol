// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract PoolVotingLikes {

    bool public updatePoolRankingParam = false;
    bool public removeAllVotingParam = false;
    bool public grabKlayFromExchangeParam = false;
    bool public gmarketUpdateAParam = false;
    bool public gmarketUpdateBParam = false;

    address public gov2Address;
    address public exchangeAddress;
    address public removeAllVotingAddress;

    uint public poolCount = 0;

    function setGovernance(address _gov) public {
        gov2Address = _gov;
    }

    function governance() public view returns (address) {
        return gov2Address;
    }

    function updatePoolRanking() public {
        updatePoolRankingParam = true;
    }

    function setPoolCount(uint _poolCount) public {
        poolCount = _poolCount;
    }

    function poolAmount(address _ranking) public view returns (uint) {
        return 10;
    }

    function poolRanking(uint _index) public view returns (address) {
        return exchangeAddress;
    }

    function setExchangeAddress(address _exAddress) public {
        exchangeAddress = _exAddress;
    }

    function removeAllVoting(address _exAddress) public {
        removeAllVotingParam = true;
        removeAllVotingAddress = _exAddress;
    }

    function grabKlayFromExchange() public payable {
        grabKlayFromExchangeParam = true;
    }

    function marketUpdateA(uint _amount) public {
        gmarketUpdateAParam = true;
    }

    function marketUpdateB(uint _amount) public {
        gmarketUpdateBParam = true;
    }
}