// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract PoolVoting {
    uint public constant MAX_VOTING_POOL_COUNT = 10;

    mapping(address => mapping(uint => address)) public userVotingPoolAddress;
    mapping(address => mapping(uint => uint)) public userVotingPoolAmount;
    mapping(address => uint) public userVotingPoolCount;

    mapping(address => uint) public poolAmount;
    mapping(uint => address) public poolRanking;
    uint public poolCount = 0;

    mapping(address => uint) public marketIndexA;
    mapping(address => uint) public marketIndexB;
    mapping(address => mapping(address => uint)) public userLastIndexA;  // 유저가 보상을 받아간 시점의 인덱스
    mapping(address => mapping(address => uint)) public userLastIndexB;  // 유저가 보상을 받아간 시점의 인덱스
    mapping(address => mapping(address => uint)) public userRewardSumA;  // 유저의 누적 보상
    mapping(address => mapping(address => uint)) public userRewardSumB;  // 유저의 누적 보상

    bool public entered = false;

    address public governance;
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
