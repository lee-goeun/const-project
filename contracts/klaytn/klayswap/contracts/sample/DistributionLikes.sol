// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract DistributionLikes {

    address public cnAddress;
    address public stakeTo;

    bool public initParam = false;
    bool public depositKlayParam = false;
    bool public depositTokenParam = false;
    bool public refixDistParam = false;
    bool public refixBlockParam = false;
    bool public estimateParam = false;
    bool public removeParam = false;
    bool public distributeParam = false;

    uint public msgValueDepositKlay = 0;
    uint public depositAmount = 0;
    uint public refixAmount = 0;

    function init(address _token, uint _blockAmount, uint _blockNumber, address[] memory _targets, uint[] memory _rates) public {
        initParam = true;
    }

    function depositKlay() public payable {
        depositKlayParam = true;
        msgValueDepositKlay = msg.value;
    }

    function depositToken(uint _amount) public {
        depositTokenParam = true;
        depositAmount = _amount;
    }

    function refixDistributionRate(address[] memory _targets, uint[] memory _rates) public {
        refixDistParam = true;
    }

    function refixBlockAmount(uint _amount) public {
        refixBlockParam = true;
        refixAmount = _amount;
    }

    function estimateEndBlock() public view returns (uint) {
        return 3;
    }

    function removeDistribution() public {
        removeParam = true;
    }

    function distribute(address _user, address _target) public {
        distributeParam = true;
    }
}