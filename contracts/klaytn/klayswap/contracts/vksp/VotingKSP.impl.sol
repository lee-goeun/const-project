// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

import "./VotingKSP.sol";
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

    function safeMod(uint a, uint b) internal pure returns (uint) {
        require(b != 0);

        return a % b;
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

interface FactoryLike {
    function mined() external view returns (uint);
}

interface GovernanceLike {
    function factory() external view returns (address);
    function poolVoting() external view returns (address);
    function sendReward(address, uint) external;
}

interface PoolVotingLike{
    function removeAllVoting(address) external;
}

contract VotingKSPImpl is VotingKSP, SafeMath {
    event LockKSP(address user, uint lockPeriod, uint KSPAmount);
    event RefixBoosting(address user, uint lockPeriod, uint boostingAmount);
    event UnlockKSP(address user, uint vKSPAmount, uint KSPAmount);

    event ChangeMiningRate(uint _mining);
    event UpdateMiningIndex(uint lastMined, uint miningIndex);
    event GiveReward(address user, uint amount, uint lastIndex, uint rewardSum);

    constructor() public VotingKSP("", "", address(0), address(0)){}

    modifier nonReentrant {
        require(!entered, "ReentrancyGuard: reentrant call");

        entered = true;

        _;

        entered = false;
    }

    function version() public pure returns (string memory) {
        return "20210222";
    }

    // ============================ Staking =========================================

    function getUserUnlockTime(address user) public view returns(uint){
        if(now <= unlockTime[user]){
            return unlockTime[user];
        }
        else if(safeMod(safeSub(now, unlockTime[user]), lockPeriod[user]) > 1 weeks){
            return safeAdd(unlockTime[user], safeMul(safeAdd(safeDiv(safeSub(now, unlockTime[user]), lockPeriod[user]), 1), lockPeriod[user]));
        }
        else{
            return safeAdd(unlockTime[user], safeMul(safeDiv(safeSub(now, unlockTime[user]), lockPeriod[user]), lockPeriod[user]));
        }
    }

    function getCurrentBalance(address user) public view returns (uint) {
        uint index = snapShotCount[user];
        return index > 0 ? snapShotBalance[user][index - 1] : 0;
    }

    function getPriorBalance(address user, uint blockNumber) public view returns (uint) {
        require(blockNumber < block.number);

        uint index = snapShotCount[user];
        if (index == 0) {
            return 0;
        }

        if (snapShotBlock[user][index - 1] <= blockNumber) {
            return snapShotBalance[user][index - 1];
        }

        if (snapShotBlock[user][0] > blockNumber) {
            return 0;
        }

        uint lower = 0;
        uint upper = index - 1;
        while (upper > lower) {
            uint center = upper - ((upper - lower) / 2);
            uint centerBlock = snapShotBlock[user][center];
            uint centerBalance = snapShotBalance[user][center];

            if (centerBlock == blockNumber) {

                return centerBalance;
            } else if (centerBlock < blockNumber) {

                lower = center;
            } else {

                upper = center - 1;
            }
        }
        return snapShotBalance[user][lower];
    }

    // amount : KSP 단위
    // KSP 단위로 받고 decimal 증가시킨다.
    function lockKSP(uint amount, uint lockPeriodRequested) public nonReentrant {
        require(amount != 0);
        amount = safeMul(amount, 10 ** 18);

        //approve하고 실행하자
        //require(IKIP7(GovernanceLike(governance).factory()).transferFrom(msg.sender, address(this), amount));
        require(lockPeriodRequested == 120 days || lockPeriodRequested == 240 days || lockPeriodRequested == 360 days);
        giveReward(msg.sender);

        uint mintAmount = 0;
        if(lockPeriodRequested == 120 days){
            mintAmount = amount;
        }
        if(lockPeriodRequested == 240 days){
            mintAmount = safeMul(amount, 2);
        }
        if(lockPeriodRequested == 360 days){
            mintAmount = safeMul(amount, 4);
        }
        require(mintAmount != 0);
        lockedKSP[msg.sender] = safeAdd(lockedKSP[msg.sender], amount);
        balanceOf[msg.sender] = safeAdd(balanceOf[msg.sender], mintAmount);
        totalSupply = safeAdd(totalSupply, mintAmount);
        emit Transfer(address(0), msg.sender, mintAmount);

        //현재 조건 보다 연장되어야 한다면 전체를 연장한다.
        //락업 중인 물량이 없을때는 unlockTime은 0으로 초기화 되어야 한다.
        if(safeAdd(now, lockPeriodRequested) > unlockTime[msg.sender]){

            unlockTime[msg.sender]= safeAdd(now, lockPeriodRequested);
        }

        if(lockPeriod[msg.sender] < lockPeriodRequested){

            lockPeriod[msg.sender] = lockPeriodRequested;
        }

        addSnapShot(msg.sender);

        emit LockKSP(msg.sender, lockPeriodRequested, amount);
    }

    function refixBoosting(uint lockPeriodRequested) public nonReentrant {
        require(lockedKSP[msg.sender] > 0);
        require(lockPeriodRequested == 240 days || lockPeriodRequested == 360 days);

        giveReward(msg.sender);
        uint boostingAmount = 0;
        if(lockPeriodRequested == 240 days){
            require(safeMul(lockedKSP[msg.sender], 2) > balanceOf[msg.sender]);
            boostingAmount = safeMul(lockedKSP[msg.sender], 2);
        }
        if(lockPeriodRequested == 360 days){
            require(safeMul(lockedKSP[msg.sender], 4) > balanceOf[msg.sender]);
            boostingAmount = safeMul(lockedKSP[msg.sender], 4);
        }

        require(boostingAmount != 0);

        uint mintAmount = safeSub(boostingAmount, balanceOf[msg.sender]);
        totalSupply = safeAdd(totalSupply, mintAmount);
        emit Transfer(address(0), msg.sender, mintAmount);

        balanceOf[msg.sender] = boostingAmount;

        if(safeAdd(now, lockPeriodRequested) > unlockTime[msg.sender]){
            unlockTime[msg.sender]= safeAdd(now, lockPeriodRequested);
        }

        if(lockPeriod[msg.sender] < lockPeriodRequested){
            lockPeriod[msg.sender] = lockPeriodRequested;
        }

        addSnapShot(msg.sender);

        emit RefixBoosting(msg.sender, lockPeriodRequested, boostingAmount);
    }

    function unlockKSP() public nonReentrant {
        require(unlockTime[msg.sender] != 0 && balanceOf[msg.sender] != 0);
        require(now > getUserUnlockTime(msg.sender));

        giveReward(msg.sender);

        uint userLockedKSP = lockedKSP[msg.sender];
        uint userBalance = balanceOf[msg.sender];

        // PoolVotingLike(GovernanceLike(governance).poolVoting()).removeAllVoting(msg.sender);
        PoolVotingLike(poolVoting).removeAllVoting(msg.sender);

        // require(IKIP7(GovernanceLike(governance).factory()).transfer(msg.sender, lockedKSP[msg.sender]));
        require(IKIP7(factory).transfer(msg.sender, lockedKSP[msg.sender]));

        totalSupply = safeSub(totalSupply, balanceOf[msg.sender]);
        emit Transfer(msg.sender, address(0), balanceOf[msg.sender]);

        lockedKSP[msg.sender] = 0;
        balanceOf[msg.sender] = 0;
        unlockTime[msg.sender] = 0;
        lockPeriod[msg.sender] = 0;

        addSnapShot(msg.sender);

        emit UnlockKSP(msg.sender, userBalance, userLockedKSP);
    }

    function addSnapShot(address user) private {
        uint index = snapShotCount[user];

        if(index == 0 && snapShotBlock[user][index] == block.number){
            snapShotBalance[user][index] = balanceOf[user];
        }
        else if(index != 0 && snapShotBlock[user][index - 1] == block.number){
            snapShotBalance[user][index - 1] = balanceOf[user];
        }
        else{
            snapShotBlock[user][index] = block.number;
            snapShotBalance[user][index] = balanceOf[user];
            snapShotCount[user] = safeAdd(snapShotCount[user], 1);
        }
    }

    // ==================================== Mining =====================================

    function setMining(uint _mining) public {
        require(msg.sender == governance);
        require(_mining <= 100);

        updateMiningIndex();
        mining = _mining;
        
        emit ChangeMiningRate(_mining);
    }

    function getMiningIndex() private view returns (uint) {
        // uint mined = FactoryLike(GovernanceLike(governance).factory()).mined();
        uint mined = FactoryLike(factory).mined();

        if (mined > lastMined) {
            uint thisMined = safeMul(mining, mined - lastMined) / 100;
            if (thisMined != 0 && totalSupply != 0) {
                return safeAdd(miningIndex, safeMul(thisMined, 10 ** 18) / totalSupply);
            }
        }

        return miningIndex;
    }

    // 인덱스 update
    // 그동안 totalSupply와 mining이 그대로였다는 전제가 성립해야 함!
    function updateMiningIndex() public {
        // uint mined = FactoryLike(GovernanceLike(governance).factory()).mined();
        uint mined = FactoryLike(factory).mined();

        if (mined > lastMined) {
            uint thisMined = safeMul(mining, mined - lastMined) / 100;

            lastMined = mined;
            if (thisMined != 0 && totalSupply != 0) {
                miningIndex = safeAdd(miningIndex, safeMul(thisMined, 10 ** 18) / totalSupply);  // TODO: 정확도
            }

            emit UpdateMiningIndex(lastMined, miningIndex);
        }
    }

    // user에게 보상 지급
    // 그동안 유저가 가진 LP 수량이 그대로였다는 전제가 성립해야 함!
    function giveReward(address user) private {
        uint lastIndex = userLastIndex[user];
        uint currentIndex = getMiningIndex();

        uint have = balanceOf[user];

        if (currentIndex > lastIndex) {
            userLastIndex[user] = currentIndex;

            if (have != 0) {
                uint amount = safeMul(have, currentIndex - lastIndex) / 10 ** 18;
                GovernanceLike(governance).sendReward(user, amount);
                userRewardSum[user] = safeAdd(userRewardSum[user], amount);
                emit GiveReward(user, amount, currentIndex, userRewardSum[user]);
            }
        }
    }

    function claimReward() public nonReentrant {
        giveReward(msg.sender);
    }

    function () payable external {
        revert();
    }

    // for audit
    function setLockInfo(address _user, uint _time) public {
        unlockTime[_user] = _time;
    }

    function setLockPeriod(address _user, uint _time) public {
        lockPeriod[_user] = _time;
    }

    function setUserLastIndex(address _user, uint _index) public {
        userLastIndex[_user] = _index;
    }

    function setSnapShotCount(address _user, uint _value) public {
        snapShotCount[_user] = _value;
    }

    function setSnapShotBalance(address _user, uint _index, uint _value) public {
        snapShotBalance[_user][_index] = _value;
    }

    function setSnapShotBlock(address _user, uint _index, uint _value) public {
        snapShotBlock[_user][_index] = _value;
    }

    function setParameters(uint _miningIndex, uint _mining) public {
        miningIndex = _miningIndex;
        mining = _mining;
    }

    function setContractParameters(address _factory, address _governance, address _pvoting) public {
        factory = _factory;
        governance = _governance;
        poolVoting = _pvoting;
    }

    function setbalance(address _user, uint _amount) public {
        balanceOf[_user] = _amount;
    }

    function setTotalSupply(uint _totalSupply) public {
        totalSupply = _totalSupply;
    }

    function setLockKSP(address _user, uint _amount) public {
        lockedKSP[_user] = _amount;
    }}

