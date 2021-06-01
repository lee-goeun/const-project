// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract Store {
    mapping(address => uint112) public reserveA;
    mapping(address => uint112) public reserveB;
    mapping(address => uint32) public blockTimestampLast;

    mapping(address => uint) public priceACumulativeLast;
    mapping(address => uint) public priceBCumulativeLast;

    bool public entered = false;
    address public governance;
    address public poolContract;
    address payable public implementation;

    constructor(address payable _implementation, address _governance) public {
        implementation = _implementation;
        governance = _governance;
    }

    function _setImplementation(address payable _newImp) public {
        require(msg.sender == governance);
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