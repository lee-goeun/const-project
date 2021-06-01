// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract Supporter {
    mapping (address => address) public wallets;

    struct History {
        address payable user;
        uint lp;
        uint klay;
        uint sklay;
        uint totalReturn;
        uint uid;
        uint requestTime;
        uint completionTime;
        bool isClaimed;
    }
    
    mapping (address => uint) public claimCount;
    mapping (address => uint) public historyCount;
    mapping (address => mapping(uint => History)) public history;

    bool public _entered = false;

    address public sklayContract; // sklay token address
    address payable public poolContract; // klay-sklay pool == LP Contract
    address payable public factoryContract; // klayswap factory contract ( ksp token address )
    address payable public delegationContract; // klaystation delegation contract

    address public owner;  // Governance, 변경 가능
    address public nextOwner;  // Owner 변경 기능

    address payable public implementation; // implementation contract address
    address payable public walletImplementation; // implementation contract address

    constructor(
        address payable _implementation,
        address payable _walletImplementation,
        address payable _pool,
        address payable _delegation,
        address payable _factory,
        address _sklay
    ) public {
        owner = msg.sender;

        implementation = _implementation;
        walletImplementation = _walletImplementation;

        poolContract = _pool;
        delegationContract = _delegation;
        factoryContract = _factory;
        sklayContract = _sklay;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function _setImplementation(address payable _newImp) public onlyOwner {
        require(implementation != _newImp);
        implementation = _newImp;
    }

    function _setWalletImplementation(address payable _newImp) public onlyOwner {
        require(walletImplementation != _newImp);
        walletImplementation = _newImp;
    }

    function getWalletImplementation() public view returns(address) {
        return walletImplementation;
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
