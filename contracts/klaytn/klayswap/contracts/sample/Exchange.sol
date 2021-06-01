// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract Exchange {

    bool public changeFeeParam = false;
    bool public changeMiningRateParam = false;
    bool public grabKlayFromFactoryParam = false;
    bool public initPoolParam = false;

    address public sendRewardUser;
    address public factory;
    
    uint public MAX_MINING_POOL_COUNT = 300;
    uint public mining = 0;

    function changeFee(uint _fee) public {
        changeFeeParam = true;
    }

    function setMining(uint _input) public {
        mining = _input;
    }

    function changeMiningRate(uint _input) public {
        changeMiningRateParam = true;
    }

    function grabKlayFromFactory() public payable {
        grabKlayFromFactoryParam = true;
    }

    function initPool(address _user) public {
        initPoolParam = true;
    }

    function exchangePos(address _token, uint _amount) public view returns(uint) {
        return _amount;
    }

    function exchangeNeg(address _token, uint _amount) public view returns(uint) {
        return _amount;
    }

    function estimatePos(address _token, uint _amount) public view returns(uint) {
        return _amount;
    }

    function estimateNeg(address _token, uint _amount) public view returns(uint) {
        return _amount;
    }
}