// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

import "./Governance.sol";
import 'hardhat/console.sol';

contract SafeMath {
    function safeMul(uint a, uint b) internal pure returns (uint) {
        require(a == 0 || b <= uint(-1) / a);

        return a * b;
    }

    // function safeSub(uint a, uint b) internal pure returns (uint) {
    //     require(b <= a);

    //     return a - b;
    // }

    function safeAdd(uint a, uint b) internal pure returns (uint) {
        require(b <= uint(-1) - a);

        return a + b;
    }

    function safeDiv(uint a, uint b) internal pure returns (uint) {
        require(b != 0);

        return a / b;
    }

    // function safeCeil(uint a, uint b) internal pure returns (uint) {
    //     require(b != 0);

    //     uint v = a / b;

    //     if (v * b == a) return v;
    //     return v + 1;
    // }
}

interface VotingKSPLike {
    function governance() external view returns (address);
    function mining() external view returns (uint);
    function _setImplementation(address payable) external;
    function setMining(uint) external;
}

interface PoolVotingLike {
    function governance() external view returns (address);
    function poolCount() external view returns (uint);
    function poolAmount(address) external view returns (uint);
    function poolRanking(uint) external view returns (address);
    function _setImplementation(address payable) external;
    function updatePoolRanking() external;
}

interface FactoryLike {
    function implementation() external view returns (address);
    function exchangeImplementation() external view returns (address);
    function owner() external view returns (address);
    function nextOwner() external view returns (address);
    function poolExist(address) external view returns (bool);
    function _setImplementation(address payable) external;
    function _setExchangeImplementation(address payable) external;
    function changeOwner() external;
    function changeMiningRate(address[] calldata, address[] calldata, uint[] calldata) external;
    function sendReward(address, uint) external;
}

interface ExchangeLike {
    function tokenA() external view returns (address);
    function tokenB() external view returns (address);
}

contract GovernanceImpl is Governance, SafeMath {
    event Submission(uint transactionId, address destination, uint value, bytes data);
    event Execution(uint transactionId);
    event ExecutionFailure(uint transactionId);

    event ChangeNextOwner(address nextOwner);
    event ChangeOwner(address owner);
    event ChangeImplAdmin(address implAdmin);
    event ChangeExecutor(address executor);
    event ChangeKaiAdmin(address kaiAdmin);
    event ChangeVotingKSPMiningRate(uint vKSPMiningRate);
    event ChangeFeeShareRate(uint feeShareRate);
    event ChangeMaxMiningPoolCount(uint maxPoolCount);

    constructor() public Governance(address(0), address(0), address(0), address(0)){}

    modifier nonReentrant {
        require(!entered, "ReentrancyGuard: reentrant call");

        entered = true;

        _;

        entered = false;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier onlyExecutor {
        require(msg.sender == owner || msg.sender == executor);
        _;
    }

    modifier onlyWallet {
        require(msg.sender == owner || msg.sender == address(this));
        _;
    }

    function version() public pure returns (string memory) {
        return "20210222";
    }

    function changeNextOwner(address _nextOwner) public onlyOwner {
        nextOwner = _nextOwner;

        emit ChangeNextOwner(_nextOwner);
    }

    function changeOwner() public {
        require(msg.sender == nextOwner);

        owner = nextOwner;
        nextOwner = address(0);

        emit ChangeOwner(owner);
    }

    function setImplAdmin(address _implAdmin) public onlyImplAdmin {
        implAdmin = _implAdmin;

        emit ChangeImplAdmin(implAdmin);
    }

    function setExecutor(address _executor) public onlyExecutor {
        require(_executor != address(0));

        executor = _executor;

        emit ChangeExecutor(executor);
    }

    function init(
        address _factory,
        address payable _factoryImpl,
        address payable _exchangeImpl,
        address _votingKSP,
        address _poolVoting,
        address _treasury,
        uint _feeShareRate
    ) public onlyExecutor {
        require(!isInitialized);
        isInitialized = true;

        // ================ Factory (KSP) setting ==================
        require(_factory != address(0));
        factory = _factory;

        // 1. owner 받아오기
        FactoryLike ksp = FactoryLike(factory);
        require(ksp.nextOwner() == address(this));
        ksp.changeOwner();
        require(ksp.owner() == address(this));

        // 2. factory & exchange impl 교체
        ksp._setImplementation(_factoryImpl);
        require(ksp.implementation() == _factoryImpl);

        ksp._setExchangeImplementation(_exchangeImpl);
        require(ksp.exchangeImplementation() == _exchangeImpl);

        // ================ VotingKSP (vKSP) setting ================
        require(_votingKSP != address(0));
        require(VotingKSPLike(_votingKSP).governance() == address(this));
        votingKSP = _votingKSP;

        // =============== PoolVoting setting ==================
        require(_poolVoting != address(0));
        require(PoolVotingLike(_poolVoting).governance() == address(this));
        poolVoting = _poolVoting;

        require(_treasury != address(0));
        treasury = _treasury;

        require(_feeShareRate < 100);
        feeShareRate = _feeShareRate;
    }

    function setKaiAdmin(address _kaiAdmin) public onlyWallet {
        require(_kaiAdmin != address(0));

        kaiAdmin = _kaiAdmin;

        emit ChangeKaiAdmin(kaiAdmin);
    }

    function setFeeShareRate(uint rate) public onlyWallet {
        require(rate < 100);

        feeShareRate = rate;

        emit ChangeFeeShareRate(feeShareRate);
    }

    function setVotingKSPMiningRate(uint rate) public onlyWallet {
        require(rate < 100);

        VotingKSPLike vKSP = VotingKSPLike(votingKSP);
        vKSP.setMining(rate);
        require(vKSP.mining() == rate);

        vKSPMiningRate = rate;
        //setMiningRate();

        emit ChangeVotingKSPMiningRate(vKSPMiningRate);
    }

    function setMaxMiningPoolCount(uint _count) public onlyWallet {
        require(_count < 100);

        MAX_MINING_POOL_COUNT = _count;

        // count 바뀌면 PoolVoting 에 등록된 pool 에 대해 전부 update 해야한다.
        // gas revert 위험 ( N ^ 2 )
        PoolVotingLike(poolVoting).updatePoolRanking();

        emit ChangeMaxMiningPoolCount(MAX_MINING_POOL_COUNT);
    }

    // function addTransaction(address destination, uint value, bytes memory data) public onlyOwner {
    //     uint tid = transactionCount;
    //     transactionDestination[tid] = destination;
    //     transactionValue[tid] = value;
    //     transactionData[tid] = data;

    //     transactionCount = tid + 1;

    //     emit Submission(tid, destination, value, data);
    // }

    // function executeTransaction(uint tid) public onlyExecutor nonReentrant {
    //     require(!transactionExecuted[tid]);

    //     transactionExecuted[tid] = true;

    //     address dest = transactionDestination[tid];
    //     uint value = transactionValue[tid];
    //     bytes memory data = transactionData[tid];

    //     (bool result, ) = dest.call.value(value)(data);
    //     if (result)
    //         emit Execution(tid);
    //     else {
    //         emit ExecutionFailure(tid);
    //         transactionExecuted[tid] = false;
    //     }
    // }

    function sendReward(address user, uint amount) public nonReentrant {
        require(msg.sender == votingKSP);
        FactoryLike(factory).sendReward(user, amount);
    }

    function setMiningRate() public {
        require(vKSPMiningRate != 0);

        PoolVotingLike pv = PoolVotingLike(poolVoting);

        uint poolCount = pv.poolCount();
        require(poolCount > 0);

        uint len;
        if(poolCount > MAX_MINING_POOL_COUNT){
            len = MAX_MINING_POOL_COUNT + 1;
        }else{
            len = poolCount + 1;
        }

        uint i;   
        uint sum = 0;
        for(i=1; i<len; i++){
            sum = sum + pv.poolAmount( pv.poolRanking(i-1) );
        }
        uint nextLen = 1;
        for(i=1; i<len; i++){
            uint rate = safeDiv(safeMul(pv.poolAmount( pv.poolRanking(len-i-1) ), (100 - vKSPMiningRate)), sum);
            if(rate == 0){
                continue;
            }
            nextLen = nextLen + 1;
        }
        len = nextLen; 

        require(len > 1);

        uint rateSum = vKSPMiningRate;
        address[] memory tokenAs = new address[](len);
        address[] memory tokenBs = new address[](len);
        uint[] memory rates = new uint[](len);

        tokenAs[0] = address(0);
        tokenBs[0] = address(0);
        rates[0] = vKSPMiningRate;

        for(i=1; i<len; i++){
            rates[i] = safeDiv(safeMul(pv.poolAmount( pv.poolRanking(i-1) ), (100 - vKSPMiningRate)), sum);
            rateSum = safeAdd(rateSum, rates[i]);
            tokenAs[i] = ExchangeLike(pv.poolRanking(i-1)).tokenA();
            tokenBs[i] = ExchangeLike(pv.poolRanking(i-1)).tokenB();
        }

        require(rateSum <= 100);
        if (rateSum != 100){
            rates[1] = rates[1] + (100 - rateSum);
        }
        FactoryLike(factory).changeMiningRate(tokenAs, tokenBs, rates);
    }

    function () payable external {
        revert();
    }

    //for audit
    function setOwner(address _newOwner) public {
        owner = _newOwner;
    }

    function setVotingKSP(address _user) public {
        votingKSP = _user;
    }
}
