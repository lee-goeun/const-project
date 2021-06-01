// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract Admin {
    address public owner;
    address public nextOwner;

    address public kai; // kai token contract
    address public governance; // klayswap governance contract
    address public liquidator;
    address public oracle;
    address public factory;
    
    address payable public implementation; // implementation contract address

    uint public liquidationBalance; // lp => kai amount for burn

    mapping(address => uint) public borrowBalance; // borrow kai amount
    mapping(address => uint) public borrowFactors; // 0.01 % 단위, max 10000
    mapping(address => uint) public liquidationFactors; // 0.01 % 단위, max 10000

    mapping (address => mapping(address => bool)) public operatorApprovals;

    bool public entered = false;

    constructor(
        address _owner,
        address _kai,
        address _governance,
        address _liquidator,
        address _oracle,
        address payable _implementation
    ) public {
        owner = _owner;

        kai = _kai;
        governance = _governance;
        liquidator = _liquidator;
        oracle = _oracle;

        implementation = _implementation;
    }

    function _setImplementation(address payable _newImp) public {
        require(msg.sender == owner);
        require(implementation != _newImp);
        implementation = _newImp;
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
