// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

import "./PoolVoting.sol";
import 'hardhat/console.sol';

contract SafeMath {
    function safeMul(uint a, uint b) internal pure returns (uint) {
        require(a == 0 || b <= uint(-1) / a);

        return a * b;
    }

    function safeSub(uint a, uint b) internal pure returns (uint) {
        require(b <= a);

        return a - b;
    }

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

interface IKIP7 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface GovernanceLike {
    function votingKSP() external view returns (address);
    function factory() external view returns (address);
    function MAX_MINING_POOL_COUNT() external view returns (uint);
}

interface FactoryLike {
    function poolExist(address) external view returns (bool);
}

interface ExchangeLike {
    function tokenA() external view returns (address);
    function tokenB() external view returns (address);
}

contract PoolVotingImpl is PoolVoting, SafeMath {
    event AddVoting(address user, address exchange, uint amount);
    event RemoveVoting(address user, address exchange, uint amount);

    event UpdateMarketIndex(address exchange, address token, uint amount, uint lastMined, uint miningIndex);
    event GiveReward(address user, address exchange, address token, uint amount, uint lastIndex, uint rewardSum);

    constructor() public PoolVoting(address(0), address(0)){}

    modifier nonReentrant {
        require(!entered, "ReentrancyGuard: reentrant call");

        entered = true;

        _;

        entered = false;
    }

    function version() public pure returns (string memory) {
        return "20210222";
    }

    // amount: vKSP 단위
    function addVoting(address exchange, uint amount) public nonReentrant {
        // require(FactoryLike(GovernanceLike(governance).factory()).poolExist(exchange));
        require(amount != 0);
        _giveReward(msg.sender, exchange);

        amount = safeMul(amount, 10 ** 18);

        bool isVotedPool = false;
        uint votedAmount = 0;
        uint exchangeIndex;

        for(uint i=0; i<userVotingPoolCount[msg.sender]; i++){
            if(userVotingPoolAddress[msg.sender][i] == exchange){
                isVotedPool = true;
                exchangeIndex = i;
            }
            votedAmount = safeAdd(votedAmount, userVotingPoolAmount[msg.sender][i]);
        }

        // require(IKIP7(GovernanceLike(governance).votingKSP()).balanceOf(msg.sender) >= safeAdd(votedAmount, amount));

        if(isVotedPool){
            userVotingPoolAmount[msg.sender][exchangeIndex] = safeAdd(userVotingPoolAmount[msg.sender][exchangeIndex], amount);
        }else{
            require(userVotingPoolCount[msg.sender] < MAX_VOTING_POOL_COUNT);
            exchangeIndex = userVotingPoolCount[msg.sender];
            userVotingPoolAddress[msg.sender][exchangeIndex] = exchange;
            userVotingPoolAmount[msg.sender][exchangeIndex] = amount;
            userVotingPoolCount[msg.sender] = safeAdd(exchangeIndex, 1);
        }

        poolAmount[exchange] = safeAdd(poolAmount[exchange], amount);
        updatePoolRanking(exchange);

        emit AddVoting(msg.sender, exchange, amount);
    }

    // amount: vKSP 단위
    function removeVoting(address exchange, uint amount) public nonReentrant {
        require(exchange != address(0));
        require(amount != 0);

        _giveReward(msg.sender, exchange);

        amount = safeMul(amount, 10 ** 18);

        bool isVotedPool = false;
        uint exchangeIndex;

        for(uint i=0; i<userVotingPoolCount[msg.sender]; i++){
            if(userVotingPoolAddress[msg.sender][i] == exchange){
                isVotedPool = true;
                exchangeIndex = i;
            }
        }
        require(isVotedPool);

        if (amount >= userVotingPoolAmount[msg.sender][exchangeIndex])
            amount = userVotingPoolAmount[msg.sender][exchangeIndex];

        userVotingPoolAmount[msg.sender][exchangeIndex] = safeSub(userVotingPoolAmount[msg.sender][exchangeIndex], amount);

        if(userVotingPoolAmount[msg.sender][exchangeIndex] == 0){

            uint lastIndex = safeSub(userVotingPoolCount[msg.sender], 1);
            userVotingPoolAddress[msg.sender][exchangeIndex] = userVotingPoolAddress[msg.sender][lastIndex];
            userVotingPoolAddress[msg.sender][lastIndex] = address(0);

            userVotingPoolAmount[msg.sender][exchangeIndex] = userVotingPoolAmount[msg.sender][lastIndex];
            userVotingPoolAmount[msg.sender][lastIndex] = 0;

            userVotingPoolCount[msg.sender] = lastIndex;
        }

        poolAmount[exchange] = safeSub(poolAmount[exchange], amount);
        updatePoolRanking(exchange);

        emit RemoveVoting(msg.sender, exchange, amount);
    }

    function removeAllVoting() public nonReentrant {
        _removeAllVoting(msg.sender);
    }

    function removeAllVoting1(address user) public nonReentrant {
        //require(msg.sender == GovernanceLike(governance).votingKSP());
        require(user != address(0));

        _removeAllVoting(user);
    }

    function _removeAllVoting(address user) internal{
        uint i;
        for(i=0; i<userVotingPoolCount[user]; i++){
            address exchange = userVotingPoolAddress[user][i];
            uint amount = userVotingPoolAmount[user][i];

            _giveReward(user, exchange);

            userVotingPoolAddress[user][i] = address(0);
            userVotingPoolAmount[user][i] = 0;

            poolAmount[exchange] = safeSub(poolAmount[exchange], amount);
            updatePoolRanking(exchange);
        }
        userVotingPoolCount[user] = 0;
    }

    function updatePoolRanking1() public nonReentrant {
        //require(msg.sender == governance);

        for(uint i = 0; i < poolCount; i++){
            updatePoolRanking(poolRanking[i]);
        }
    }

    function updatePoolRanking(address exchange) private {
        bool poolExist;
        uint poolIndex;
        uint i;
        uint j;

        for(i=0; i<poolCount; i++){ 
            if(poolRanking[i] == exchange){
                poolExist = true;
                poolIndex = i;
            }
        }
        if(!poolExist){
            poolRanking[poolCount] = exchange;
            poolCount = safeAdd(poolCount, 1);
        }

        //혹시 이번에 업데이트한 exchange의 수량이 0이라면 랭킹 목록에서 제거한다.
        if(poolAmount[exchange] == 0){
            poolRanking[poolIndex] = poolRanking[safeSub(poolCount, 1)];
            poolRanking[safeSub(poolCount, 1)] = address(0); // (-) exchange;
            poolCount = safeSub(poolCount, 1);
        }

        uint max = 0;
        uint maxIndex = 0;
        address tmp = address(0);

        uint maxPool = GovernanceLike(governance).MAX_MINING_POOL_COUNT();
        for(i=0; i<maxPool; i++){
            if(i >= poolCount) 
                break;

            max = 0;
            maxIndex = 0;
            tmp = address(0);

            for(j=i; j<poolCount; j++){
                if( poolAmount[ poolRanking[j] ] > max){
                    max = poolAmount[ poolRanking[j] ];
                    maxIndex = j;
                }
            }
            
            if(max != 0){
                tmp = poolRanking[i];
                poolRanking[i] = poolRanking[ maxIndex ];
                poolRanking[ maxIndex ] = tmp;
            }
        }
    }

    function grabKlayFromExchange() public payable {
    }

    function marketUpdateA(uint amount) public nonReentrant {
        address factory = GovernanceLike(governance).factory();
        address exchange = msg.sender;

        // require(FactoryLike(factory).poolExist(exchange));

        uint lastMined = marketIndexA[exchange];
        // address token = ExchangeLike(exchange).tokenA();
        address token = address(0);
        //amount 가 0일경우 무시, poolAmount 가 0일 경우 토큰 소각;
        if(amount != 0 && poolAmount[exchange] != 0){
            marketIndexA[exchange] = safeAdd(marketIndexA[exchange], safeDiv(safeMul(amount, 10 ** 18), poolAmount[exchange]));
        }

        emit UpdateMarketIndex(exchange, token, amount, lastMined, marketIndexA[exchange]);
    }

    function marketUpdateB(uint amount) public nonReentrant {
        address factory = GovernanceLike(governance).factory();
        address exchange = msg.sender;
        
        // require(FactoryLike(factory).poolExist(exchange));

        uint lastMined = marketIndexB[exchange];
        // address token = ExchangeLike(exchange).tokenB();
        address token = address(0);

        if(amount !=0 && poolAmount[exchange] != 0){
            marketIndexB[exchange] = safeAdd(marketIndexB[exchange], safeDiv(safeMul(amount, 10 ** 18), poolAmount[exchange]));
        }

        emit UpdateMarketIndex(exchange, token, amount, lastMined, marketIndexB[exchange]);
    }

    function _giveReward(address user, address exchange) internal {
        bool poolExist;
        uint poolIndex;
        uint i;

        for(i=0; i<userVotingPoolCount[user]; i++){
            if(userVotingPoolAddress[user][i] == exchange){
                poolExist = true;
                poolIndex = i;
                break;
            }
        }

        if(!poolExist)
            return;

        uint have = userVotingPoolAmount[user][poolIndex];

        if(marketIndexA[exchange] > userLastIndexA[exchange][user]){
            uint lastIndexA = userLastIndexA[exchange][user];
            uint currentIndexA = marketIndexA[exchange];
            userLastIndexA[exchange][user] = currentIndexA;

            if(have != 0){
                address token = ExchangeLike(exchange).tokenA();
                uint amount = safeDiv(safeMul(have, safeSub(currentIndexA, lastIndexA)), 10 ** 18);

                if(token == address(0)){
                    (bool success, ) = user.call.value(amount)("");
                    // require(success, "Transfer failed.");
                }else{
                    // require(IKIP7(token).transfer(user, amount));
                }

                uint rewardSum = 0;
                {
                    rewardSum = safeAdd(userRewardSumA[exchange][user], amount);
                    userRewardSumA[exchange][user] = rewardSum;
                }

                emit GiveReward(user, exchange, token, amount, currentIndexA, rewardSum);
            }
        }
        if(marketIndexB[exchange] > userLastIndexB[exchange][user]){
            uint lastIndexB = userLastIndexB[exchange][user];
            uint currentIndexB = marketIndexB[exchange];
            userLastIndexB[exchange][user] = currentIndexB;

            if(have != 0){
                address token = ExchangeLike(exchange).tokenB();
                uint amount = safeDiv(safeMul(have, safeSub(currentIndexB, lastIndexB)), 10 ** 18);

                // require(IKIP7(token).transfer(user, amount));

                uint rewardSum = 0;
                {
                    rewardSum = safeAdd(userRewardSumB[exchange][user], amount);
                    userRewardSumB[exchange][user] = rewardSum;
                }

                emit GiveReward(user, exchange, token, amount, currentIndexB, rewardSum);
            }
        }
    }

    function claimReward(address exchange) public nonReentrant {
        _giveReward(msg.sender, exchange);
    }

    function claimRewardAll() public nonReentrant {
        _giveRewardAll(msg.sender);
    }

    function _giveRewardAll(address user) internal {
        uint i;
        for(i=0; i<userVotingPoolCount[user]; i++){
            _giveReward(user, userVotingPoolAddress[user][i]);
        }
    }

    function () payable external {
        revert();
    }

    // for audit 
    function setUserVotingPoolAmount(address _user, uint _index, uint _amount) public {
        userVotingPoolAmount[_user][_index] = _amount;
    }

    function setUserVotingPoolCount(address _user, uint _amount) public {
        userVotingPoolCount[_user] = _amount;
    }
    
    function setUserVotingPoolAddress(address _user, uint _index, address _contract) public {
        userVotingPoolAddress[_user][_index] = _contract;
    }

    function getUserVotingPoolAmount(address _user, uint _index) public view returns (uint) {
        return userVotingPoolAmount[_user][_index];
    }

    function getUserRewardSumA(address _contract, address _user) public view returns (uint) {
        return userRewardSumA[_contract][_user];
    }

    function getUserRewardSumB(address _contract, address _user) public view returns (uint) {
        return userRewardSumB[_contract][_user];
    }

    function setContractParameters(address _governance) public {
        governance = _governance;
    }

    function setPoolCount(uint _cnt) public {
        poolCount = _cnt;
    }

    function setPoolAmount(address _user, uint _cnt) public {
        poolAmount[_user] = _cnt;
    }

    function setPoolRanking(uint _index, address _contract) public {
        poolRanking[_index] = _contract;
    }

    function setUserLastIndexA(address _contract, address _user, uint _value) public {
        userLastIndexA[_contract][_user] = _value;
    }

    function setMarketIndexA(address _contract, uint _value) public {
        marketIndexA[_contract] = _value;
    }

    function setUserLastIndexB(address _contract, address _user, uint _value) public {
        userLastIndexB[_contract][_user] = _value;
    }

    function setMarketIndexB(address _contract, uint _value) public {
        marketIndexB[_contract] = _value;
    }
}
