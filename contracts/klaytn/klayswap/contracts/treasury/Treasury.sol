// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract Treasury {
    // =================== treasury entries mapping for Distribution =======================
    mapping (address => bool) public validOperator; // operator => valid;
    mapping (address => address) public distributionOperator; // distribution contract => operator
    mapping(address => mapping(address => address)) public distributions; // ( operator , treasury token ) => distribution Contract;
    mapping(address => mapping(uint => address)) public distributionEntries; // ( LP Token , index ) => Distribution Contract
    mapping(address => uint) public distributionCount;

    // ===================           Config                 =======================
    address public owner;
    address public nextOwner;
    address payable public implementation;
    address payable public distributionImplementation;

    address public ksp;
    uint public fee; // ksp fee;

    bool public entered = false;

    constructor(address payable _implementation, address payable _distributionImplementation, address _ksp, uint _fee) public {
        owner = msg.sender;
        implementation = _implementation;
        distributionImplementation = _distributionImplementation;
        ksp = _ksp;
        fee = _fee;
    }

    function _setImplementation(address payable _newImp) public {
        require(msg.sender == owner);
        require(implementation != _newImp);
        implementation = _newImp;
    }

    function _setDistributionImplementation(address payable _newDistributionImp) public {
        require(msg.sender == owner);
        require(distributionImplementation != _newDistributionImp);
        
        distributionImplementation = _newDistributionImp;
    }

    function getDistributionImplementation() public view returns(address) {
        return distributionImplementation;
    }

    function () payable external {
        address impl = implementation;
        require(impl != address(0));
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize)
            let result := delegatecall(gas, impl, ptr, calldatasize, 0, 0)
            let size := returndatasize
            returndatacopy(ptr, 0, size)

            switch result
            case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }
}
