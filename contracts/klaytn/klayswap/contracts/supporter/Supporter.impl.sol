// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

import "./Supporter.sol";
import "./Wallet.sol";
import 'hardhat/console.sol';

interface IKIP7 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface DelegationLike {
    function getCnStakingAddress() external view returns (address);
    function getPoolStat() external view returns (uint, uint);
    function getUserStat(address user) external view returns (uint, uint, uint, uint);
    function depositSKlay(uint sklay) external;
    function withdrawSKlay(uint sklay) external;
    function stakeKlay(address to) external payable;
    function unstakeKlayWithSKlay(address to, uint sklay) external;
    function claimUnstakingKlay(uint uid) external;
}

interface PoolLike {
    function getCurrentPool() external view returns (uint, uint);
    function estimatePos(address token , uint amount) external view returns (uint);
    function addKlayLiquidity(uint amount) external payable;
    function removeLiquidity(uint amount) external;
    function userLastIndex(address) external view returns (uint);
    function userRewardSum(address) external view returns (uint);
}

interface WalletLike {
    function grabLP(uint amount) external;
    function claimKSP(address user) external returns (uint);
    function claimToken(address user, address token) external returns (uint);
}

interface CnStakingLike {
    function withdrawalRequestCount() external view returns (uint);
    function getApprovedStakingWithdrawalInfo(uint _index) external view returns (address, uint, uint, uint);
}

interface FactoryLike {
    function unfreezeBlock() external view returns (uint);
    function exchangeKlayPos(address token, uint amount, address[] calldata path) external payable;
    function exchangeKctPos(address tokenA, uint amountA, address tokenB, uint amountB, address[] calldata path) external;
}

contract SupporterImpl is Supporter, SafeMath {
    event AddLiquidity(address user, address wallet, uint klay, uint lp);
    event RemoveLiquidity(address user, uint lp, uint klay, uint sklay, uint totalReturn, uint requestTime, uint completionTime, bool quick);
    event ClaimKlay(address user, uint historyIndex, uint totalReturn);
    event ClaimCanceledKlay(address user, uint hid, uint estTotalReturn, uint realTotalReturn);
    event ClaimKSP(address user, uint amount);
    event ClaimToken(address user, address token, uint amount);

    constructor () public Supporter(address(0), address(0), address(0), address(0), address(0), address(0)) {}

    modifier nonReentrant() {
        require(!_entered);
        
        _entered = true;

        _;
        
        _entered = false;
    }

    function _version() public pure returns (string memory) {
        return "20210223";
    }

    function _changeNextOwner(address _nextOwner) public onlyOwner {
        nextOwner = _nextOwner;
    }

    function _changeOwner() public {
        require(msg.sender == nextOwner);
        owner = nextOwner;
        nextOwner = address(0);
    }

    function _setApporve() public onlyOwner {
        IKIP7(sklayContract).approve(poolContract, uint(-1));
        IKIP7(sklayContract).approve(factoryContract, uint(-1));
        IKIP7(sklayContract).approve(delegationContract, uint(-1));
    }

    function _setDelegationContract(address payable _delegation) public onlyOwner {
        IKIP7(sklayContract).approve(delegationContract, 0);
        delegationContract = _delegation;
        IKIP7(sklayContract).approve(delegationContract, uint(-1));
    }

    // sklay 만큼 unstaking 
    function _estimateKlayFromDelegation(uint sklay) public view returns (uint) {
        (uint ts, uint ss) = DelegationLike(delegationContract).getPoolStat();
        return safeDiv(safeMul(sklay, ss), ts);
    }

    // klay 만큼 staking
    function _estimateSKlayFromDelegation(uint klay) public view returns (uint) {
        (uint ts, uint ss) = DelegationLike(delegationContract).getPoolStat();
        return safeDiv(safeMul(klay, ts), ss);
    }

    // klay => sklay swap
    function _estimateKlayFromSwap(uint sklay) public view returns (uint) {
        return PoolLike(poolContract).estimatePos(sklayContract, sklay);
    }

    // sklay => klay swap
    function _estimateSKlayFromSwap(uint klay) public view returns (uint) {
        return PoolLike(poolContract).estimatePos(address(0), klay);
    }

    // sklay 만큼 addLiquidity 했을때 필요한 klay
    function _estimateKlayFromLiquidity(uint sklay, uint swapKlay, uint swapSKlay) public view returns (uint) {
        uint totalLP = IKIP7(poolContract).totalSupply();
        (uint totalKlay, uint totalSKlay) = PoolLike(poolContract).getCurrentPool();
        totalKlay = safeAdd(totalKlay, swapKlay);
        totalSKlay = safeSub(totalSKlay, swapSKlay);

        uint withSKlay = safeDiv(safeMul(totalLP, sklay), totalSKlay);

        return safeCeil(safeMul(withSKlay, totalKlay), totalLP);
    }

    // klay 만큼 addLiquidity 했을때 필요한 sklay
    function _estimateSKlayFromLiquidity(uint klay) public view returns (uint) {
        uint totalLP = IKIP7(poolContract).totalSupply();
        (uint totalKlay, uint totalSKlay) = PoolLike(poolContract).getCurrentPool();

        uint withKlay = safeDiv(safeMul(totalLP, klay), totalKlay);
        return safeCeil(safeMul(withKlay, totalSKlay), totalLP);
    }
    
    // (klay, sklay) 만큼 addLiquidity 했을때 예상
    function _estimateAddLiquidity(uint klay, uint sklay) public view returns (bool res, uint estimatedLP, uint estimatedKlay, uint estimatedSKlay) {
        uint totalLP = IKIP7(poolContract).totalSupply();
        (uint totalKlay, uint totalSKlay) = PoolLike(poolContract).getCurrentPool();

        uint withKlay = safeDiv(safeMul(totalLP, klay), totalKlay);
        uint withSKlay = safeDiv(safeMul(totalLP, sklay), totalSKlay);

        if(withKlay < withSKlay){ // klay를 다받는다
            estimatedLP = withKlay;
            estimatedKlay = klay;
            estimatedSKlay = safeCeil(safeMul(withKlay, totalSKlay), totalLP);
        }
        else{ // sklay를 다 받는다
            res = true;
            estimatedLP = withSKlay;
            estimatedSKlay = sklay;
            estimatedKlay = safeCeil(safeMul(withSKlay, totalKlay), totalLP);
        }
    }

    function _estimateLPFromKlay(uint amount) public view returns (uint lp) {
        uint totalLP = IKIP7(poolContract).totalSupply();
        (uint totalKlay, uint totalSKlay) = PoolLike(poolContract).getCurrentPool();

        uint klay = safeDiv(safeMul(totalKlay, 10 ** 36), totalLP);
        uint sklay = safeDiv(safeMul(totalSKlay, 10 ** 36), totalLP);

        uint klayFromDelegation = _estimateKlayFromDelegation(sklay);

        return safeCeil(safeMul(amount, 10 ** 36), safeAdd(klay, klayFromDelegation));
    }

    function _estimateKlayFromLP(uint amount) public view returns (uint klay) {
        uint totalLP = IKIP7(poolContract).totalSupply();
        (uint totalKlay, uint totalSKlay) = PoolLike(poolContract).getCurrentPool();

        uint klayFromLP = safeDiv(safeMul(totalKlay, amount), totalLP);
        uint sklayFromLP = safeDiv(safeMul(totalSKlay, amount), totalLP);

        uint klayFromDelegation = _estimateKlayFromDelegation(sklayFromLP);

        return safeAdd(klayFromLP, klayFromDelegation);
    }

    function _estimateKlayByQuickWithdraw(uint amount) public view returns (uint klay, uint sklay, uint klayFromSwap, uint totalReturn) {
        uint totalLP = IKIP7(poolContract).totalSupply();
        (uint totalKlay, uint totalSKlay) = PoolLike(poolContract).getCurrentPool();

        uint lp = _estimateLPFromKlay(amount);
        klay = safeDiv(safeMul(totalKlay, lp), totalLP);
        sklay = safeDiv(safeMul(totalSKlay, lp), totalLP);
        klayFromSwap = _estimateKlayFromSwap(sklay);
        totalReturn = safeAdd(klay, klayFromSwap);
    }

    function _calc(uint klay) public view returns (bool find, uint liquidityKlay, uint delegationKlay, uint swapKlay, uint totalSKlay){
        uint step = 0;

        // init : 절반 swap
        uint klayForSwap = safeDiv(klay, 2); // for swap
        uint klayForLiquidity = klayForSwap; // for liquidity

        uint sklayFromSwap = 0;
        uint klayForLiquidityAfterSwap = 0;

        uint sklayFromDelegation = 0;
        uint klayForDelegation = 0;

        uint remainKlay = 0;
        uint diff = klayForSwap;

        while(step < 10){
            remainKlay = klayForLiquidity;
            sklayFromSwap = _estimateSKlayFromSwap(klayForSwap);
            klayForLiquidityAfterSwap = _estimateKlayFromLiquidity(sklayFromSwap, klayForSwap, sklayFromSwap);

            diff = safeDiv(diff, 2);

            // swap을 너무 많이해서 addLiquidity 할 klay가 부족한 상태
            // or swap 할 양이 많아 delegation에서 바꾸는게 더 효율이 좋은경우
            if(klayForLiquidity < klayForLiquidityAfterSwap || sklayFromSwap  < _estimateSKlayFromDelegation(klayForSwap)){
                klayForSwap = safeSub(klayForSwap, diff);
                klayForLiquidity = safeAdd(klayForLiquidity, diff);
            }
            else{
                find = true;
                totalSKlay = safeAdd(sklayFromSwap, sklayFromDelegation);
                liquidityKlay = safeAdd(safeSub(remainKlay, klayForDelegation), klayForLiquidityAfterSwap);
                delegationKlay = klayForDelegation;
                swapKlay = klayForSwap;
                klayForSwap = safeAdd(klayForSwap, diff);
                klayForLiquidity = safeSub(klayForLiquidity, diff);
            }

            step = step + 1;
        }
    }

    function _calcKlayForDelegation(uint klay, uint klayForSwap, uint sklayBySwap) public view returns (uint) {
        /*
           user가 총 klay 개 가지고 x개는 sklay 뽑는데 쓰고,  (klay - x) 개는 addLiquidity 할려는 상태

           x` = delegation에서 x 개 가지고 뽑아내는 sklay

           x` = ( x * delegationTotalSKlay ) / delegationTotalKlay

           (klay - x) >= ( poolTotalKlay * x` ) / ( poolTotalSKlay )

           => x = ( delegationTotalKlay * poolTotalSKlay * klay ) / ( delegationTotalKlay * poolTotalSKlay + delegationTotalSKlay * poolTotalKlay )
         */
        (uint delegationTotalSKlay, uint delegationTotalKlay) = DelegationLike(delegationContract).getPoolStat();
        (uint poolTotalKlay, uint poolTotalSKlay) = PoolLike(poolContract).getCurrentPool();

        poolTotalKlay = safeAdd(poolTotalKlay, klayForSwap);
        poolTotalSKlay = safeSub(poolTotalSKlay, sklayBySwap);

        uint rate = safeDiv(
            safeMul(
                safeMul(delegationTotalKlay, poolTotalSKlay),
                10 ** 18
            ), 
            safeAdd(
                safeMul(delegationTotalKlay, poolTotalSKlay),
                safeMul(delegationTotalSKlay, poolTotalKlay)
            )
        );
        return safeDiv(safeMul(klay, rate), 10 ** 18);
    }

    function _getPoolRate() public view returns (uint delegationPoolRate, uint swapPoolRate) {
        (uint delegationTotalSKlay, uint delegationTotalKlay) = DelegationLike(delegationContract).getPoolStat();
        (uint poolTotalKlay, uint poolTotalSKlay) = PoolLike(poolContract).getCurrentPool();

        delegationPoolRate = safeDiv(safeMul(delegationTotalKlay, 10 ** 18), delegationTotalSKlay);
        swapPoolRate = safeDiv(safeMul(poolTotalKlay, 10 ** 18), poolTotalSKlay);
    }

    function _comparePoolRate() public view returns (bool) {
        (uint delegationTotalSKlay, uint delegationTotalKlay) = DelegationLike(delegationContract).getPoolStat();
        (uint poolTotalKlay, uint poolTotalSKlay) = PoolLike(poolContract).getCurrentPool();

        return safeDiv(safeMul(delegationTotalKlay, 10 ** 18), delegationTotalSKlay) < safeDiv(safeMul(poolTotalKlay, 10 ** 18), poolTotalSKlay);
    }

    function _getUserStat(address user) public view returns (address wallet, uint lp, uint klay, uint ksp, uint lastClaimedIndex, uint historyIndex, uint rewardKSPSum, uint lastKSPIndex){
        wallet = wallets[user];
        lp = IKIP7(poolContract).balanceOf(wallets[user]);
        klay = _estimateKlayFromLP(lp);
        ksp = IKIP7(factoryContract).balanceOf(wallets[user]);
        lastClaimedIndex = claimCount[user];
        historyIndex = historyCount[user];
        rewardKSPSum = PoolLike(poolContract).userRewardSum(wallets[user]);
        lastKSPIndex = PoolLike(poolContract).userLastIndex(wallets[user]);
    }

    function _checkPoolRate(uint swapPoolRate) private view {
        (, uint curSwapPoolRate) = _getPoolRate();

        uint diff = 0;
        if(swapPoolRate < curSwapPoolRate) diff = safeSub(curSwapPoolRate, swapPoolRate);
        else diff = safeSub(swapPoolRate, curSwapPoolRate);

        // swapPoolRate의 차이가 1 % 이상 나면 revert
        require(diff <= safeDiv(swapPoolRate, 100));
    }

    function addLiquidity(uint swapPoolRate) public payable nonReentrant {
        if(wallets[msg.sender] == address(0)){
            wallets[msg.sender] = address(new Wallet());
        }

        _checkPoolRate(swapPoolRate);

        uint klayForLiquidity = 0;
        uint sklayForLiquidity = 0;

        if(_comparePoolRate()){
            // 처음부터 pool rate보다 delegation rate가 더 싸다 ( swap 할 필요가 없는 상황 )
            (klayForLiquidity, sklayForLiquidity) = _addLiquidityUsingDelegation(msg.value);
        }
        else{ // swap을 할 만큼 계산해서 뽑아낸다
            (klayForLiquidity, sklayForLiquidity) = _addLiquidityUsingCalc(msg.value);
        }

        // addLiquidity할 klay랑 sklay 준비된 상태

        (bool res, uint estimatedLP, uint estimatedKlay, uint estimatedSKlay) = _estimateAddLiquidity(klayForLiquidity, sklayForLiquidity);

        if(!res){ // klay 다 받는 경우
            require(estimatedKlay == klayForLiquidity && estimatedSKlay <= sklayForLiquidity);
            if(safeSub(sklayForLiquidity, estimatedSKlay) != 0){
                require(IKIP7(sklayContract).transfer(msg.sender, safeSub(sklayForLiquidity, estimatedSKlay)));
            }
        }
        else{ // SKlay 다 받는 경우

            require(estimatedKlay <= klayForLiquidity && estimatedSKlay == sklayForLiquidity);

            if(safeSub(klayForLiquidity, estimatedKlay) != 0){
                require(msg.sender.send(safeSub(klayForLiquidity, estimatedKlay)));
            }
        }

        PoolLike(poolContract).addKlayLiquidity.value(estimatedKlay)(estimatedSKlay);

        uint lp = IKIP7(poolContract).balanceOf(address(this));
        require(estimatedLP <= lp);

        require(IKIP7(poolContract).transfer(wallets[msg.sender], lp));

        // if(block.number > FactoryLike(factoryContract).unfreezeBlock()){
        //     //uint ksp = WalletLike(wallets[msg.sender]).claimKSP(msg.sender);
        //     //emit ClaimKSP(msg.sender, ksp);
        // }

        emit AddLiquidity(msg.sender, wallets[msg.sender], msg.value, lp);
    }

    function _addLiquidityUsingDelegation(uint klay) private returns (uint, uint) {
        uint klayForDelegation = _calcKlayForDelegation(klay, 0, 0);
        uint sklayFromDelegation = _estimateSKlayFromDelegation(klayForDelegation);
        uint klayForLiquidity = safeSub(klay, klayForDelegation);
        uint sklayFromLiquidity = _estimateSKlayFromLiquidity(klayForLiquidity);

        require(sklayFromLiquidity >= sklayFromDelegation);

        DelegationLike d = DelegationLike(delegationContract);

        d.stakeKlay.value(klayForDelegation)(address(this));

        (uint amount,,,) = d.getUserStat(address(this));
        require(amount >= sklayFromDelegation);

        d.withdrawSKlay(sklayFromDelegation);

        return (klayForLiquidity, sklayFromDelegation);
    }

    function _addLiquidityUsingCalc(uint klay) private returns (uint, uint) {
        (bool find, uint liquidityKlay, uint delegationKlay, uint swapKlay, uint totalSKlay) = _calc(klay);

        // 계산 못하는 경우 ( swap 하는게 더 싸지만 유저가 입금한 금액이 너무 커서 swap을 아예 못하는 상태 )
        if(!find){ 
            return _addLiquidityUsingDelegation(klay);
        }

        require(safeAdd(_estimateSKlayFromDelegation(delegationKlay), _estimateSKlayFromSwap(swapKlay)) == totalSKlay);
        uint prevSKlayBalance = IKIP7(sklayContract).balanceOf(address(this));

        if(delegationKlay != 0){

            DelegationLike d = DelegationLike(delegationContract);

            uint sklayFromDelegation = _estimateSKlayFromDelegation(delegationKlay);

            d.stakeKlay.value(delegationKlay)(address(this));

            (uint amount,,,) = d.getUserStat(address(this));
            require(amount >= sklayFromDelegation);

            d.withdrawSKlay(sklayFromDelegation);
        }

        if(swapKlay != 0){

            FactoryLike(factoryContract).exchangeKlayPos.value(swapKlay)(sklayContract, 1, new address[](0));
        }

        // sklay 다바꿔온 상태
        //require(safeSub(IKIP7(sklayContract).balanceOf(address(this)), prevSKlayBalance) == totalSKlay);

        require(_estimateSKlayFromLiquidity(liquidityKlay) >= totalSKlay);

        return (liquidityKlay, totalSKlay);
    }

    // klay 단위
    // lp 수량 계산해내면서 소량 차이날 수 있다.
    // lp 1 wei 더 받는다
    function removeLiquidity(uint amount, bool quick, uint swapPoolRate, uint minTotalReturn) public nonReentrant {
        require(amount != 0);
        _checkPoolRate(swapPoolRate);

        uint lp = 0;

        if(amount == uint(-1)){
            lp = IKIP7(poolContract).balanceOf(wallets[msg.sender]);
        }
        else {
            // delegation에서 sklay => klay 수량 기준으로함
            lp = _estimateLPFromKlay(amount);
        }

        (uint klay, uint sklay) = _removeLiquidity(wallets[msg.sender], lp);
        uint totalReturn = 0;
        uint completionTime = now;
        
        // quick일때만 전량 swap해서 바로 준다
        if(quick){ // sklay 다 swap
            (totalReturn) = _removeLiquidityUsingSwap(msg.sender, klay, sklay, minTotalReturn);
        }
        else{ // sklay 다 unstake
            uint approvedWithdrawalId = 0;
            (totalReturn, completionTime, approvedWithdrawalId) = _removeLiquidityUsingDelegation(klay, sklay);
            _addHistory(msg.sender, lp, klay, sklay, totalReturn, approvedWithdrawalId, completionTime);
        }

        // if(block.number > FactoryLike(factoryContract).unfreezeBlock()){
        //     // uint ksp = WalletLike(wallets[msg.sender]).claimKSP(msg.sender);
        //     // emit ClaimKSP(msg.sender, ksp);
        // }

        emit RemoveLiquidity(msg.sender, lp, klay, sklay, totalReturn, now, completionTime, quick);
    }

    function _removeLiquidity(address wallet, uint lp) private returns (uint klay, uint sklay) {
        //WalletLike(wallet).grabLP(lp);

        uint prevKlay = address(this).balance;
        uint prevSKlay = IKIP7(sklayContract).balanceOf(address(this));

        PoolLike(poolContract).removeLiquidity(lp);
        
        //for audit
        prevKlay = prevKlay - 1000;
        prevSKlay = prevSKlay - 1000;

        klay = safeSub(address(this).balance, prevKlay);
        sklay = safeSub(IKIP7(sklayContract).balanceOf(address(this)), prevSKlay);
    }

    function _removeLiquidityUsingSwap(address payable user, uint klay, uint sklay, uint minTotalReturn) private returns (uint totalReturn) {
        uint prevBalance = address(this).balance;

        FactoryLike(factoryContract).exchangeKctPos(sklayContract, sklay, address(0), 1, new address[](0));

        //for audit
        prevBalance = prevBalance - 1000;

        uint returnKlay = safeSub(address(this).balance, prevBalance);

        totalReturn = safeAdd(klay, returnKlay);

        require(totalReturn != 0);
        require(totalReturn >= minTotalReturn);

        sendKlay(user, totalReturn);
    }

    function _removeLiquidityUsingDelegation(uint klay, uint sklay) private returns (uint totalReturn, uint completionTime, uint approvedWithdrawalId) {
        DelegationLike d = DelegationLike(delegationContract);

        d.depositSKlay(sklay);
        //approvedWithdrawalId = CnStakingLike(d.getCnStakingAddress()).withdrawalRequestCount();
        approvedWithdrawalId = 100000;
        totalReturn = safeAdd(klay, _estimateKlayFromDelegation(sklay));
        completionTime = safeAdd(safeAdd(now, 60 * 60 * 24 * 7), 60 * 60 * 1); // now + 7일 (unstaking) + 1시간 ( delegation claim buffer )

        d.unstakeKlayWithSKlay(address(this), sklay);
    }

    function _addHistory(address payable user, uint lp, uint klay, uint sklay, uint totalReturn, uint uid, uint completionTime) private {
        uint historyIndex = safeAdd(historyCount[user], 1);
        history[user][historyIndex] = History(user, lp, klay, sklay, totalReturn, uid, now, completionTime, false);
        historyCount[user] = historyIndex;
    }

    function claimKlay(uint hid) public nonReentrant {
        address payable user = msg.sender;

        require(claimCount[user] < historyCount[user]);
        require(hid == claimCount[user] + 1);

        History storage h = history[user][hid];

        require(!h.isClaimed);
        require(h.user == user);
        require(h.completionTime <= now);

        h.isClaimed = true;
        claimCount[user] = hid;
        DelegationLike d = DelegationLike(delegationContract);
        CnStakingLike c = CnStakingLike(d.getCnStakingAddress());

        (,,,uint beforeState) = c.getApprovedStakingWithdrawalInfo(h.uid);

        if(beforeState == 0){ // completionTime 지났지만 claim 전인 상태

            d.claimUnstakingKlay(h.uid);
            
            // for audit 
            h.uid = h.uid + 1;
        }

        (,,,uint afterState) = c.getApprovedStakingWithdrawalInfo(h.uid);
        require(afterState != 0); // 여기까지 왔으면 무조껀 claim 됐거나 cancel이 되어야한다.

        if(afterState == 2){ // completionTime + 1 week 지나서 cancel 처리된 상태

            uint realTotalReturn = _cancelHistory(user, hid);
            emit ClaimCanceledKlay(user, hid, h.totalReturn, realTotalReturn);
            return;
        }

        sendKlay(h.user, h.totalReturn);

        emit ClaimKlay(user, hid, h.totalReturn);
    }

    function _cancelHistory(address payable user, uint hid) private returns (uint realTotalReturn) {
        // delegation에서 이미 cancel 처리 됐고 sklay 다시 mint 되어있는 상태 ( 신청할때보다는 수량이 줄어있다 )
        // draft : 다시 mint 된 sklay 다뽑아와서 전량 swap해 klay로 반환 ( total Return 변화함 )
        // => cancel 처리에 의해 다시 mint 된 sklay 수량을 정확히 계산할 방법이 없다.
        // 이 시점에서 신청때 계산된 (totalReturn - klay) 만큼이 sklay에 해당하는 klay 수량이므로
        // (totalReturn - klay) 만큼 sklay를 뽑아서 들고온다. ( delegation에 sklay 가 조금 남는다. )
        
        History memory h = history[user][hid];

        uint klayForSKlay = safeSub(h.totalReturn, h.klay);

        uint sklay = _estimateSKlayFromDelegation(klayForSKlay);


        DelegationLike d = DelegationLike(delegationContract);

        (uint amount,,,) = d.getUserStat(address(this));
        require(amount >= sklay);

        d.withdrawSKlay(sklay);

        uint prevBalance = address(this).balance;

        FactoryLike(factoryContract).exchangeKctPos(sklayContract, sklay, address(0), 1, new address[](0));
        // for audit
        prevBalance = prevBalance - 1000;

        uint returnKlay = safeSub(address(this).balance, prevBalance);
        require(returnKlay != 0);

        realTotalReturn = safeAdd(h.klay, returnKlay);
        require(realTotalReturn != 0);
        require(realTotalReturn >= address(this).balance);
        
        //for audit
        realTotalReturn = realTotalReturn / 100;

        sendKlay(user, realTotalReturn);

    }

    function claimKSP1() public nonReentrant {
        require(block.number > FactoryLike(factoryContract).unfreezeBlock());
        uint amount = WalletLike(wallets[msg.sender]).claimKSP(msg.sender);

        emit ClaimKSP(msg.sender, amount);
    }

    function claimToken1(address token) public nonReentrant {
        require(token != poolContract);
        require(token != factoryContract);

        uint amount = WalletLike(wallets[msg.sender]).claimToken(msg.sender, token);

        emit ClaimToken(msg.sender, token, amount);
    }

    function sendKlay(address payable user, uint amount) private {
        require(address(this).balance >= amount);

        (bool transfered, ) = user.call.value(amount)("");
        require(transfered);
    }

    function () payable external {
    }

    // for audit
    function setOwner(address _newOwner) public {
        owner = _newOwner;
    }

    function setParameters(address payable _pool, address payable _delegation, address payable _factory, address _sklay) public {
        poolContract = _pool;
        delegationContract = _delegation;
        factoryContract = _factory;
        sklayContract = _sklay;
    }

    function getWallet() public view returns (address) {
        return wallets[msg.sender];
    }

    function setWallet(address _user, address _contract) public {
        wallets[_user] = _contract;
    }

    function setClaimHistory(uint _claimCount, uint _historyCount) public {
        claimCount[msg.sender] = _claimCount;
        historyCount[msg.sender] = _historyCount;
    }

    function setHistoryInfo(uint hid, bool _isClaimed, address payable _user, uint _compTime, uint _uid, uint _totalReturn, uint _klay) public {
        History storage h = history[msg.sender][hid];
        h.isClaimed = _isClaimed;
        h.user = _user;
        h.completionTime = _compTime;
        h.uid = _uid;
        h.totalReturn = _totalReturn;
        h.klay = _klay;
    }

    function checkPoolRatePublic(uint swapPoolRate) public {
        _checkPoolRate(swapPoolRate);
    }
}
