// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract VotingKSP {
    // ======== KIP7 =========
    event Transfer(address indexed from, address indexed to, uint amount);
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint public totalSupply = 0;
    mapping(address => uint) public balanceOf;

    address public governance; // governance contract
    address payable public implementation; // implementation contract address
    address public factory;
    address public poolVoting;

    // ========= Staking =============
    mapping(address => uint) public lockedKSP;
    mapping(address => uint) public unlockTime;
    mapping(address => uint) public lockPeriod;

    mapping(address => uint) public snapShotCount;
    mapping(address => mapping(uint => uint)) public snapShotBlock;
    mapping(address => mapping(uint => uint)) public snapShotBalance;

    // ========== Mining ==============
    uint public mining; // Mining rate: 마이닝 수량 중에 mining / 100 을 가져감
    uint public lastMined; // 마지막으로 확인한 블록까지 마이닝으로 풀린 물량
    uint public miningIndex;  // 1LP당 가치 * 10 ** 18
    mapping(address => uint) public userLastIndex;  // 유저가 보상을 받아간 시점의 인덱스
    mapping(address => uint) public userRewardSum;  // 유저의 누적 보상

    bool public entered = false;
    
    // production ( impl 에서는 empty string )
    // _name : Voting KlaySwap Protocal
    // _symbol : vKSP
    constructor(string memory _name, string memory _symbol, address payable _implementation, address _governance) public {
        name = _name;
        symbol = _symbol;
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
