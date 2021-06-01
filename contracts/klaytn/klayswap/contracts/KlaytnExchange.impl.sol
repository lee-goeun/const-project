// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

import "./KlaytnExchange.sol";
import 'hardhat/console.sol';

contract KSStoreLike{
    function setEntered() public;
    function setNotEntered() public;
    function isEntered() public view returns (bool);
}

contract FactoryLike {
    function mined() public view returns (uint);
    function sendReward(address, uint) public;
    function grabKlayFromExchange() public payable;
    function sendTokenToExchange(address, uint) public;
    function owner() public view returns(address);
}

interface GovernanceLike {
    function feeShareRate() external view returns (uint);
    function poolVoting() external view returns (address);
    function treasury() external view returns (address);
    function kaiAdmin() external view returns (address);
}

interface PoolVotingLike {
    function grabKlayFromExchange() external payable;
    function marketUpdateA(uint) external;
    function marketUpdateB(uint) external;
}

interface TreasuryLike {
    function claim(address, address) external;
}

interface KaiAdminLike {
    function operatorApprovals(address, address) external view returns (bool);
    function canTransferable(address, address, uint) external view returns (bool);
    function borrowBalance(address) external view returns (uint);
    function setOperatorApproval(address, bool) external;
    function emitUserStat(address) external;
}

contract ExchangeImpl is Exchange {
    function version() public pure returns (string memory) {
        return "20210219";
    }

    modifier nonReentrant() {
        //When deploying FactoryIMPL contract, you must check it KSStore contract address.
        // KSStoreLike store = KSStoreLike(0x0000000000000000000000000000000000000000);
        // require(!store.isEntered(), "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        // store.setEntered();

        _;

        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        // store.setNotEntered();
    }
    
    constructor() public Exchange(address(0), address(1), 0){}

    function transfer(address _to, uint _value) public nonReentrant returns (bool) {
        decreaseBalance(msg.sender, _value);
        increaseBalance(_to, _value);

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint _value) public nonReentrant returns (bool) {
        decreaseBalance(_from, _value);
        increaseBalance(_to, _value);

        if(needAllowance(_from)){
            allowance[_from][msg.sender] = safeSub(allowance[_from][msg.sender], _value);
        }

        emit Transfer(_from, _to, _value);

        return true;
    }

    function needAllowance(address _from) private view returns (bool) {
        address kaiAdmin = getKaiAdmin();

        if(kaiAdmin == address(0)) return true;

        return msg.sender != kaiAdmin || !KaiAdminLike(kaiAdmin).operatorApprovals(_from, address(this));
    }

    function approve(address _spender, uint _value) public returns (bool) {
        require(_spender != address(0));

        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function setOperatorApproval(bool _valid) public returns (bool) {
        address kaiAdmin = getKaiAdmin();

        require(kaiAdmin != address(0));

        KaiAdminLike(kaiAdmin).setOperatorApproval(msg.sender, _valid);

        return true;
    }

    // ======== Change supply & balance ========
    // supply가 바뀌면 반드시 index 갱신
    // balance가 바뀌면 반드시 보상 지급

    function increaseTotalSupply(uint amount) private {
        updateMiningIndex();
        totalSupply = safeAdd(totalSupply, amount);
    }

    function decreaseTotalSupply(uint amount) private {
        updateMiningIndex();
        totalSupply = safeSub(totalSupply, amount);
    }

    function increaseBalance(address user, uint amount) private {
        giveReward(user);
        balanceOf[user] = safeAdd(balanceOf[user], amount);

        KaiAdminLike kaiAdmin = KaiAdminLike(getKaiAdmin());

        if(address(kaiAdmin) != address(0)){
            if(kaiAdmin.operatorApprovals(user, address(this)) && kaiAdmin.borrowBalance(user) != 0){
                kaiAdmin.emitUserStat(user);
            }
        }
    }

    function decreaseBalance(address user, uint amount) private {
        giveReward(user);

        KaiAdminLike kaiAdmin = KaiAdminLike(getKaiAdmin());

        if(address(kaiAdmin) != address(0)){
            require(kaiAdmin.canTransferable(user, address(this), amount));
        }

        balanceOf[user] = safeSub(balanceOf[user], amount);

        if(address(kaiAdmin) != address(0)){
            if(balanceOf[user] == 0 && kaiAdmin.operatorApprovals(user, address(this))){
                kaiAdmin.setOperatorApproval(user, false);
            }
        }
    }

    function getKaiAdmin() public view returns (address) {
        // return GovernanceLike(FactoryLike(factory).owner()).kaiAdmin();
        return kaiAdminC;
    }

    function getTreasury() public view returns (address) {
        // return GovernanceLike(FactoryLike(factory).owner()).treasury();
        return treasury;
    }

    // Factory가 Klay 보낼 때는 반드시 이 메서드 사용
    // 풀 만들면서 최초 유동성 공급, Klay -> Kct 교환
    function grabKlayFromFactory() public payable {
        require(msg.sender == factory);
        require(tokenA == address(0));
    }

    // 그 외의 fallback은 전부 실패시킴
    function() payable external { revert(); }

    // 토큰 이름 변경용 유틸
    function getTokenSymbol(address token) private view returns (string memory) {
        if (token == address(0)) return "KLAY";
        return ERC20(token).symbol();
    }

    // to: 처음으로 발행되는 LP를 받아갈 지갑 (pool maker)
    function initPool(address to) public {
        // require(msg.sender == factory);

        // LP 발행 - A 기준으로 매김 (그냥 편해서)
        (uint amount, ) = getCurrentPool();

        increaseTotalSupply(amount);
        increaseBalance(to, amount);

        emit Transfer(address(0), to, amount);  // mint event

        // 토큰 이름 변경
        string memory symbolA = getTokenSymbol(tokenA);
        string memory symbolB = getTokenSymbol(tokenB);

        name = string(abi.encodePacked(name, " ", symbolA, "-", symbolB));

        // Klay면 decimal은 그대로 18
        if (tokenA != address(0)) decimals = ERC20(tokenA).decimals();
    }

    // ======== Administration ========

    event ChangeMiningRate(uint _mining);
    event ChangeFee(uint _fee);

    function changeMiningRate(uint _mining) public {
        // require(msg.sender == factory);
        require(_mining <= 100);

        updateMiningIndex();
        mining = _mining;

        emit ChangeMiningRate(_mining);
    }

    function changeFee(uint _fee) public {
        require(msg.sender == factory);
        require(_fee <= 100);

        fee = _fee;

        emit ChangeFee(_fee);
    }

    // ======== Mining & Reward ========

    event UpdateMiningIndex(uint lastMined, uint miningIndex);
    event GiveReward(address user, uint amount, uint lastIndex, uint rewardSum);

    // 현재의 mining index
    function getMiningIndex() private view returns (uint) {
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
        uint mined = FactoryLike(factory).mined();  // 이번 블록까지 마이닝되는 수량

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
        // TreasuryLike(getTreasury()).claim(user, address(this));
        TreasuryLike(treasury).claim(user, address(this));

         // => klay를 받을 수 있어진다. reentrancy 걸리는 곳 없는지 더 확인 필요
         // => Exchange contract 에서는 claimReward + KIP7 method reentrancy modifier 추가 하면 끝 ?

        uint lastIndex = userLastIndex[user];
        uint currentIndex = getMiningIndex();

        uint have = balanceOf[user];

        if (currentIndex > lastIndex) {
            userLastIndex[user] = currentIndex;

            if (have != 0) {
                uint amount = safeMul(have, currentIndex - lastIndex) / 10 ** 18;
                FactoryLike(factory).sendReward(user, amount);

                userRewardSum[user] = safeAdd(userRewardSum[user], amount);
                emit GiveReward(user, amount, currentIndex, userRewardSum[user]);
            }
        }
    }

    function claimReward() public nonReentrant {
        giveReward(msg.sender);
    }

    // ======== Exchange ========
    // 교환은 factory를 통해서만 할 수 있음

    event ExchangePos(address tokenA, uint amountA, address tokenB, uint amountB);
    event ExchangeNeg(address tokenA, uint amountA, address tokenB, uint amountB);

    // 교환 수량 예상
    // Pos: input만큼 들고 와서 전부 바꿔갈 때 예상 수량
    // Neg: output만큼 받고 싶을 때 가져와야 하는 input 수량 (불가능하면 INF)
    // Fee 정책: 유저가 가져온 토큰에서 fee를 뗀 만큼이 실제로 들어왔다고 가정 (실제로는 떼인 fee가 그냥 pool에 남음)

    function calcPos(uint poolIn, uint poolOut, uint input) private view returns (uint) {
        if (totalSupply == 0) return 0;

        uint num = safeMul(poolOut, safeMul(input, 10000 - fee));
        uint den = safeAdd(safeMul(poolIn, 10000), safeMul(input, 10000 - fee));

        return safeDiv(num, den);
    }

    function calcNeg(uint poolIn, uint poolOut, uint output) private view returns (uint) {
        if (output >= poolOut) return uint(-1);

        uint num = safeMul(poolIn, safeMul(output, 10000));
        uint den = safeMul(poolOut - output, 10000 - fee);

        return safeCeil(num, den);
    }

    function getCurrentPool() public view returns (uint, uint) {
        uint poolA = 0;

        if (tokenA == address(0)) {
            poolA = address(this).balance;
        }
        else {
            poolA = ERC20(tokenA).balanceOf(address(this));
        }

        uint poolB = ERC20(tokenB).balanceOf(address(this));

        return (poolA, poolB);
    }

    // token을 amount개 가져왔으니 다 바꿔 주세요
    function estimatePos(address token, uint amount) public view returns (uint) {
        require(token == tokenA || token == tokenB);

        (uint poolA, uint poolB) = getCurrentPool();

        if (token == tokenA) {
            return calcPos(poolA, poolB, amount);
        }

        return calcPos(poolB, poolA, amount);
    }

    // token을 amount개 받고 싶은데 상대 토큰 몇 개 가져와야 해요
    function estimateNeg(address token, uint amount) public view returns (uint) {
        require(token == tokenA || token == tokenB);

        (uint poolA, uint poolB) = getCurrentPool();

        if (token == tokenA) {
            return calcNeg(poolB, poolA, amount);  // A를 받고 싶은 거니까 B -> A
        }

        return calcNeg(poolA, poolB, amount);
    }

    // 토큰을 msg.sender에게서 amount만큼 가져옴 (수량 확인)
    // 유저가 유동성 공급하려고 할 때 사용
    function grabToken(address token, uint amount) private {
        require(token != address(0));  // Klay는 못 가져옴...

        uint userBefore = ERC20(token).balanceOf(msg.sender);
        uint thisBefore = ERC20(token).balanceOf(address(this));

        require(ERC20(token).transferFrom(msg.sender, address(this), amount));

        uint userAfter = ERC20(token).balanceOf(msg.sender);
        uint thisAfter = ERC20(token).balanceOf(address(this));

        require(safeAdd(userAfter, amount) == userBefore);
        require(thisAfter == safeAdd(thisBefore, amount));
    }

    // 토큰을 msg.sender에게 amount만큼 줌 (수량 확인)
    // 교환, 유동성 공급 후 남는 Klay 환불, 유동성 제거
    function sendToken(address token, uint amount) private {
        if (token == address(0)) {  // Klay
            if(msg.sender == factory){
                // FactoryLike(factory).grabKlayFromExchange.value(amount)();
            }
            else {
                (bool success, ) = msg.sender.call.value(amount)("");
                require(success, "Transfer failed.");
            } 
        }
        else {
            uint userBefore = ERC20(token).balanceOf(msg.sender);
            uint thisBefore = ERC20(token).balanceOf(address(this));

            require(ERC20(token).transfer(msg.sender, amount));

            uint userAfter = ERC20(token).balanceOf(msg.sender);
            uint thisAfter = ERC20(token).balanceOf(address(this));

            require(userAfter == safeAdd(userBefore, amount));
            require(safeAdd(thisAfter, amount) == thisBefore);
        }
    }

    //For Governance
    function sendTokenToPoolVoting(address poolVoting, address token, uint amount) private {
        if (token == address(0)) {  // Klay
            PoolVotingLike(poolVoting).grabKlayFromExchange.value(amount)();
        }
        else {
            uint userBefore = ERC20(token).balanceOf(poolVoting);
            uint thisBefore = ERC20(token).balanceOf(address(this));

            require(ERC20(token).transfer(poolVoting, amount));

            uint userAfter = ERC20(token).balanceOf(poolVoting);
            uint thisAfter = ERC20(token).balanceOf(address(this));

            require(userAfter == safeAdd(userBefore, amount));
            require(safeAdd(thisAfter, amount) == thisBefore);
        }
    }

    // token amount개 가져왔으니 다 바꿔 줘
    function exchangePos(address token, uint amount) public returns (uint) {
        // require(msg.sender == factory);  // 교환은 반드시 factory 거쳐서

        require(token == tokenA || token == tokenB);
        require(amount != 0);

        uint output = 0;
        (uint poolA, uint poolB) = getCurrentPool();

        if (token == tokenA) {  // A -> B
            output = calcPos(poolA, poolB, amount);
            require(amount != 0);
            FactoryLike(factory).sendTokenToExchange(tokenA, amount);  // 이거 Klay도 그냥 가능하지 않을까
            sendToken(tokenB, output);
            emit ExchangePos(tokenA, amount, tokenB, output);

            //For Governance
            // address governance = FactoryLike(factory).owner();
            uint feeShareRate = GovernanceLike(governance).feeShareRate();
            uint feeShare = safeDiv(safeMul(safeMul(amount, fee), feeShareRate), 10000 * 100);
            if(feeShare != 0){
                address poolVoting = GovernanceLike(governance).poolVoting();
                sendTokenToPoolVoting(poolVoting, tokenA, feeShare);
                PoolVotingLike(poolVoting).marketUpdateA(feeShare);
            }
        }
        else {  // B -> A
            output = calcPos(poolB, poolA, amount);
            require(amount != 0);

            FactoryLike(factory).sendTokenToExchange(tokenB, amount);
            sendToken(tokenA, output);  // Klay를 보낼 수는 있음

            emit ExchangePos(tokenB, amount, tokenA, output);

            //For Governance
            // address governance = FactoryLike(factory).owner();
            uint feeShareRate = GovernanceLike(governance).feeShareRate();
            uint feeShare = safeDiv(safeMul(safeMul(amount, fee), feeShareRate), 10000 * 100);
            if(feeShare != 0){
                address poolVoting = GovernanceLike(governance).poolVoting();
                sendTokenToPoolVoting(poolVoting, tokenB, feeShare);
                PoolVotingLike(poolVoting).marketUpdateB(feeShare);
            }
        }

        return output;
    }

    // token amount개 만들어 줘
    function exchangeNeg(address token, uint amount) public returns (uint) {
        // require(msg.sender == factory);  // 교환은 반드시 factory 거쳐서

        require(token == tokenA || token == tokenB);
        require(amount != 0);

        uint input = 0;
        (uint poolA, uint poolB) = getCurrentPool();

        if (token == tokenA) {
            input = calcNeg(poolB, poolA, amount);  // A를 원하는 거니까 B -> A
            FactoryLike(factory).sendTokenToExchange(tokenB, input);
            sendToken(tokenA, amount);

            emit ExchangeNeg(tokenB, input, tokenA, amount);

            //For Governance
            // address governance = FactoryLike(factory).owner();
            uint feeShareRate = GovernanceLike(governance).feeShareRate();
            uint feeShare = safeDiv(safeMul(safeMul(amount, fee), feeShareRate), 10000 * 100);
            if(feeShare != 0){
                address poolVoting = GovernanceLike(governance).poolVoting();
                sendTokenToPoolVoting(poolVoting, tokenB, feeShare);
                PoolVotingLike(poolVoting).marketUpdateB(feeShare);
            }
        }
        else {
            input = calcNeg(poolA, poolB, amount);

            FactoryLike(factory).sendTokenToExchange(tokenA, input);
            sendToken(tokenB, amount);

            emit ExchangeNeg(tokenA, input, tokenB, amount);

            //For Governance
            // address governance = FactoryLike(factory).owner();
            uint feeShareRate = GovernanceLike(governance).feeShareRate();
            uint feeShare = safeDiv(safeMul(safeMul(amount, fee), feeShareRate), 10000 * 100);
            if(feeShare != 0){
                address poolVoting = GovernanceLike(governance).poolVoting();
                sendTokenToPoolVoting(poolVoting, tokenA, feeShare);
                PoolVotingLike(poolVoting).marketUpdateA(feeShare);
            }
        }

        return input;
    }

    // ======== Add/remove Liquidity ========
    // 유동성 공급, 제거는 아무나 할 수 있음

    event AddLiquidity(address user, address tokenA, uint amountA, address tokenB, uint amountB, uint liquidity);
    event RemoveLiquidity(address user, address tokenA, uint amountA, address tokenB, uint amountB, uint liquidity);

    // tokenA는 amountA만큼, tokenB는 amountB만큼
    function addLiquidity(uint amountA, uint amountB) private returns (uint, uint){
        require(amountA != 0 && amountB != 0);
        uint realA = amountA;
        uint realB = amountB;

        (uint poolA, uint poolB) = getCurrentPool();
        if (tokenA == address(0)) poolA = safeSub(poolA, amountA);

        if (totalSupply == 0) {  // 유동성이 텅 비어서 최초 기여자가 됨
            if (tokenA != address(0)) grabToken(tokenA, amountA);
            grabToken(tokenB, amountB);

            increaseTotalSupply(amountA);
            increaseBalance(msg.sender, amountA);

            emit AddLiquidity(msg.sender, tokenA, amountA, tokenB, amountB, amountA);

            emit Transfer(address(0), msg.sender, amountA);  // mint event
        }
        else {
            uint withA = safeDiv(safeMul(totalSupply, amountA), poolA);
            uint withB = safeDiv(safeMul(totalSupply, amountB), poolB);

            if (withA < withB) {  // A는 전부 받고, B는 계산해서 받음
                require(withA > 0);

                if (tokenA != address(0)) grabToken(tokenA, amountA);

                realB = safeCeil(safeMul(withA, poolB), totalSupply);
                require(realB <= amountB);

                grabToken(tokenB, realB);

                increaseTotalSupply(withA);
                increaseBalance(msg.sender, withA);

                emit AddLiquidity(msg.sender, tokenA, amountA, tokenB, realB, withA);

                emit Transfer(address(0), msg.sender, withA);  // mint event
            }
            else {  // B 전부 받고, A는 계산해서 받음
                require(withB > 0);

                grabToken(tokenB, amountB);

                realA = safeCeil(safeMul(withB, poolA), totalSupply);
                require(realA <= amountA);

                if (tokenA == address(0)) {
                    if (realA < amountA) {
                        (bool success, ) = msg.sender.call.value(amountA - realA)("");
                        require(success, "Transfer failed.");
                    }
                }
                else grabToken(tokenA, realA);

                increaseTotalSupply(withB);
                increaseBalance(msg.sender, withB);

                emit AddLiquidity(msg.sender, tokenA, realA, tokenB, amountB, withB);

                emit Transfer(address(0), msg.sender, withB);  // mint event
            }
        }
        return (realA, realB);
    }

    function addKlayLiquidity(uint amount) public payable nonReentrant{
        require(tokenA == address(0));
        addLiquidity(msg.value, amount);
    }

    function addKctLiquidity(uint amountA, uint amountB) public nonReentrant{
        require(tokenA != address(0));
        addLiquidity(amountA, amountB);
    }

    function removeLiquidity(uint amount) public nonReentrant {
        require(amount != 0);

        (uint poolA, uint poolB) = getCurrentPool();

        uint amountA = safeDiv(safeMul(poolA, amount), totalSupply);
        uint amountB = safeDiv(safeMul(poolB, amount), totalSupply);

        decreaseTotalSupply(amount);
        decreaseBalance(msg.sender, amount);

        emit Transfer(msg.sender, address(0), amount);  // burn

        if (amountA > 0) sendToken(tokenA, amountA);
        if (amountB > 0) sendToken(tokenB, amountB);

        emit RemoveLiquidity(msg.sender, tokenA, amountA, tokenB, amountB, amount);
    }

    function addKlayLiquidityWithLimit(uint amount, uint minAmountA, uint minAmountB) public payable nonReentrant{
        require(tokenA == address(0));
        (uint realA, uint realB) = addLiquidity(msg.value, amount);
        require(realA >= minAmountA, "minAmountA is not satisfied");
        require(realB >= minAmountB, "minAmountB is not satisfied");
    }

    function addKctLiquidityWithLimit(uint amountA, uint amountB, uint minAmountA, uint minAmountB) public nonReentrant{
        require(tokenA != address(0));
        (uint realA, uint realB) = addLiquidity(amountA, amountB);
        require(realA >= minAmountA, "minAmountA is not statisfied");
        require(realB >= minAmountB, "minAmountB is not statisfied");
    }

    //  returns (uint, uint) ????
    function removeLiquidityWithLimit(uint amount, uint minAmountA, uint minAmountB) public nonReentrant {
        require(amount != 0);

        (uint poolA, uint poolB) = getCurrentPool();

        uint amountA = safeDiv(safeMul(poolA, amount), totalSupply);
        uint amountB = safeDiv(safeMul(poolB, amount), totalSupply);

        require(amountA >= minAmountA, "minAmountA is not satisfied");
        require(amountB >= minAmountB, "minAmountB is not satisfied");

        decreaseTotalSupply(amount);
        decreaseBalance(msg.sender, amount);

        emit Transfer(msg.sender, address(0), amount);  // burn

        if (amountA > 0) sendToken(tokenA, amountA);
        if (amountB > 0) sendToken(tokenB, amountB);

        emit RemoveLiquidity(msg.sender, tokenA, amountA, tokenB, amountB, amount);
    }

    // for audit
    function setTreasury (address _treasury) public {
        treasury = _treasury;
    }

    function setFactory (address _treasury) public {
        factory = _treasury;
    }

    function setGovernance (address _treasury) public {
        governance = _treasury;
    }

    function setAdmin (address _treasury) public {
        kaiAdminC = _treasury;
    }

    function setMiningIndex(uint _index) public {
        miningIndex = _index;
    }

    function setBalance(address _user, uint _balance) public {
        balanceOf[_user] = _balance;
    }

    function decreaseBalancePublic(address _user, uint _amount) public {
        decreaseBalance(_user, _amount);
    }

    function increaseBalancePublic(address _user, uint _amount) public {
        increaseBalance(_user, _amount);
    }
    
    function setAllowance(address _from, address _to, uint _amount) public {
        allowance[_from][_to] = _amount;
    }

    function getAllowance(address _from, address _to) public view returns(uint) {
        return allowance[_from][_to];
    }

    function getMiningIndexPublic() public view returns(uint) {
        return getMiningIndex();
    }

    function setTotalSupply(uint _amount) public {
        totalSupply = _amount;
    }

    function setMining(uint _value) public {
        mining = _value;
    }

    function increaseTotalSupplyPublic(uint _amount) public {
        increaseTotalSupply(_amount);
    }

    function decreaseTotalSupplyPublic(uint _amount) public {
        decreaseTotalSupply(_amount);
    }

    function setToken(address _tokenA, address _tokenB) public {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function grabTokenPublic(address _token, uint _amount) public {
        grabToken(_token, _amount);
    }

    function sendTokenPublic(address _token, uint _amount) public {
        sendToken(_token, _amount);
    }

    function getKlaytnBalance(address _addr) public view returns(uint) {
        return _addr.balance;
    }

    function sendTokenPoolVotingPublic(address _contract, address _token, uint _amount) public {
        sendTokenToPoolVoting(_contract, _token, _amount);
    }

    function needAllowancePublic(address _from) public view returns(bool) {
        return needAllowance(_from);
    }

    function getTokenSymbolPublic(address _from) public view returns(string memory) {
        return getTokenSymbol(_from);
    }

    function calcPosPublic(uint _num1, uint _num2, uint _num3) public view returns(uint) {
        return calcPos(_num1, _num2, _num3);
    }

    function calcNegPublic(uint _num1, uint _num2, uint _num3) public view returns(uint) {
        return calcNeg(_num1, _num2, _num3);
    }
}
