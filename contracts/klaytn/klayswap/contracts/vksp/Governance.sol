// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

interface ImplLike {
    function _setImplementation(address payable) external;
    function _setExchangeImplementation(address payable) external;
}

contract Governance {
    /*********************
      1. 해당 컨트랙트는 기본적으로 Factory의 어드민
      2. 거버넌스 합의를 통해 특정 트랜젝션을 어드민 명으로 실행할 수 있음
      3. 당분간은 2중 거버넌스 체계로, 개발사의 최종 컨펌을 받아야지만 실행 되도록 한다.
     *********************/

    uint public MAX_MINING_POOL_COUNT = 20;

    address public owner;
    address public nextOwner;
    address public implAdmin;
    address public executor;

    address public factory;
    address public votingKSP;
    address public poolVoting;
    address public treasury;
    address public kaiAdmin;
    address payable public implementation; // implementation contract address

    uint public vKSPMiningRate = 0; //default 10
    uint public feeShareRate = 0; //default 50

    bool public isInitialized = false;
    bool public entered = false;

    uint public transactionCount = 0;
    mapping (uint => bool) public transactionExecuted;
    mapping (uint => address) public transactionDestination;
    mapping (uint => uint) public transactionValue;
    mapping (uint => bytes) public transactionData;

    constructor(address payable _implementation, address _owner, address _implAdmin, address _executor) public {
        implementation = _implementation;
        owner = _owner;
        implAdmin = _implAdmin;
        executor = _executor;
    }

    modifier onlyImplAdmin { // owner or implOwner or onlyWallet
        require(msg.sender == owner
                || msg.sender == implAdmin
                || msg.sender == address(this));
        _;
    }

    function _setImplementation(address payable _newImp) public onlyImplAdmin {
        require(implementation != _newImp);
        implementation = _newImp;
    }

    function _setFactoryImplementation(address payable _newImp) public onlyImplAdmin {
        ImplLike(factory)._setImplementation(_newImp);
    }

    function _setExchangeImplementation(address payable _newImp) public onlyImplAdmin {
        ImplLike(factory)._setExchangeImplementation(_newImp);
    }

    function _setVotingKSPImplementation(address payable _newImp) public onlyImplAdmin {
        ImplLike(votingKSP)._setImplementation(_newImp); 
    }

    function _setPoolVotingImplementation(address payable _newImp) public onlyImplAdmin {
        ImplLike(poolVoting)._setImplementation(_newImp); 
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
