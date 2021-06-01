// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

interface TreasuryImplLike {
    function getDistributionImplementation() external view returns (address);
}

contract Distribution {
    // =================== treasury entries mapping for Distribution =======================
    mapping(uint => address) public targetEntries;
    uint public targetCount; // target entry valid count

    // ===================      Index for Distribution      =======================
    address public token; // airdrop token
    uint public totalAmount; // 총 airdrop 될 물량
    uint public blockAmount; // 한블록에 몇개씩 분배할껀지
    uint public distributableBlock; // distribution start block
    uint public distributedAmount; // refix 된 경우 그 시점 이전까지 분배된 총 물량

    mapping(address => uint) public distributionRate; // LP Token => rate
    mapping(address => uint) public lastDistributed; // LP Token => lastDistributed
    mapping(address => uint) public distributionIndex; // LP Token => distributionIndex
    mapping(address => mapping(address => uint)) public userLastIndex; // ( LP Token, user ) => last claim Index
    mapping(address => mapping(address => uint)) public userRewardSum;  // ( LP Token, user ) => reward sum

    // ===================           Config                 =======================
    bool public entered = false;
    bool public isInitialized = false;
    address public treasury;
    address public operator;

    constructor(address _operator) public {
        treasury = msg.sender;
        operator = _operator;
    }

    function () payable external {
        address impl = TreasuryImplLike(treasury).getDistributionImplementation();
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
