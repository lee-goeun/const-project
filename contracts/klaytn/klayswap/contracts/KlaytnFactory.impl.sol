// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

import "./KlaytnExchange.sol";
import "./KlaytnFactory.sol";
import 'hardhat/console.sol';

contract KSStoreLike{
    function setEntered() public;
    function setNotEntered() public;
    function isEntered() public view returns (bool);
}

contract ExchangeLike {
    function changeFee(uint _fee) public;
    function mining() public view returns (uint);
    function changeMiningRate(uint _mining) public;
    function grabKlayFromFactory() public payable;
    function initPool(address to) public;
    function exchangePos(address token, uint amount) public returns (uint);
    function exchangeNeg(address token, uint amount) public returns (uint);
    function estimatePos(address token, uint amount) public view returns (uint);
    function estimateNeg(address token, uint amount) public view returns (uint);
}

contract FactoryImpl is Factory, SafeMath {
    constructor() public Factory(address(0), address(0), 126144000000000000000000000, 63072000, 43497371, 48681371, 15){}

    function version() public pure returns (string memory) {
        return "20210201";
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

    // ======== ERC20 =========
    function transfer(address _to, uint _value) public returns (bool) {
        require(block.number >= unfreezeBlock);

        balanceOf[msg.sender] = safeSub(balanceOf[msg.sender], _value);
        balanceOf[_to] = safeAdd(balanceOf[_to], _value);

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint _value) public returns (bool) {
        require(block.number >= unfreezeBlock);

        balanceOf[_from] = safeSub(balanceOf[_from], _value);
        balanceOf[_to] = safeAdd(balanceOf[_to], _value);
        allowance[_from][msg.sender] = safeSub(allowance[_from][msg.sender], _value);

        emit Transfer(_from, _to, _value);

        return true;
    }

    function approve(address _spender, uint _value) public returns (bool) {
        require(_spender != address(0));

        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    // ======== Administration ========

    event ChangeCreateFee(uint _createFee);
    event ChangeTeamWallet(address _teamWallet);
    event ClaimTeamAward(uint award, uint totalAward);

    event ChangeNextOwner(address nextOwner);
    event ChangeOwner(address owner);

    function changeNextOwner(address _nextOwner) public {
        require(msg.sender == owner);
        nextOwner = _nextOwner;

        emit ChangeNextOwner(_nextOwner);
    }

    function changeOwner() public {
        require(msg.sender == nextOwner);
        owner = nextOwner;
        nextOwner = address(0);

        emit ChangeOwner(owner);
    }

    // 상장 fee 변경
    function changeCreateFee(uint _createFee) public {
        require(msg.sender == owner);
        createFee = _createFee;  // TODO: 범위?

        emit ChangeCreateFee(_createFee);
    }

    // 팀 물량 받아갈 지갑 설정
    function changeTeamWallet(address _teamWallet) public {
        require(msg.sender == owner);
        teamWallet = _teamWallet;

        emit ChangeTeamWallet(_teamWallet);
    }

    // pool 수수료 변경
    function changePoolFee(address tokenA, address tokenB, uint fee) public {
        require(msg.sender == owner);

        // 0.01% 단위, 0% ~ 1%
        require(fee <= 100);

        address exc = tokenToPool[tokenA][tokenB];
        require(exc != address(0));

        ExchangeLike(exc).changeFee(fee);  // 여기서 이벤트 불림
    }

    // owner 권한으로 마이닝 배분량 조절
    // rate가 있는 애들만 넣음
    function changeMiningRate(address[] memory tokenA, address[] memory tokenB, uint[] memory rate) public {
        require(msg.sender == owner);

        uint n = tokenA.length;

        //For Governance
        require(n > 1 && tokenA[0] == address(0) && tokenB[0] == address(0));

        require(n <= 100);
        require(tokenB.length == n && rate.length == n);

        uint rateSum = 0;
        address[] memory excs = new address[](n);  // 각 pool의 주소 캐싱

        for (uint i = 0; i < n; i++) {
            require(rate[i] != 0);
            rateSum = safeAdd(rateSum, rate[i]);

            //For Governance
            if(i == 0)
                continue;

            address exc = tokenToPool[tokenA[i]][tokenB[i]];
            require(exc != address(0));

            excs[i] = exc;

            for (uint j = 0; j < i; j++) {  // unique check
                require(excs[j] != exc);
            }
        }

        require(rateSum == 100);  // 무조건 합이 100

        uint poolCount = pools.length;

        // 원래 rate가 있었는데 없어지는 애들
        for (uint i = 0; i < poolCount; i++) {
            if (ExchangeLike(pools[i]).mining() == 0) continue;

            bool exist = false;

            for (uint j = 0; j < n; j++) {
                if (excs[j] == pools[i]) {
                    exist = true;
                    break;
                }
            }

            if (!exist) {
                ExchangeLike(pools[i]).changeMiningRate(0);  // 각자 이벤트 불림
            }
        }

        // For Governance : start index of 1
        for (uint i = 1; i < n; i++) {
            if (ExchangeLike(excs[i]).mining() != rate[i]) {
                ExchangeLike(excs[i]).changeMiningRate(rate[i]);
            }
        }
    }

    // [minableBlock, minableBlock + halfLife) 까지 보상 발생
    function claimTeamAward() public {
        require(teamWallet != address(0));

        uint nowBlock = block.number;

        if (nowBlock >= minableBlock) {
            if (nowBlock >= minableBlock + halfLife) {
                nowBlock = minableBlock + halfLife - 1;
            }

            uint num = teamRatio * (nowBlock - minableBlock + 1);
            uint den = 200 * halfLife;

            uint totalAward = safeMul(miningAmount, num) / den;

            if (totalAward > teamAward) {
                uint award = totalAward - teamAward;

                balanceOf[address(this)] = safeSub(balanceOf[address(this)], award);
                balanceOf[teamWallet] = safeAdd(balanceOf[teamWallet], award);

                emit ClaimTeamAward(award, totalAward);
                emit Transfer(address(this), teamWallet, award);

                teamAward = totalAward;
            }
        }
    }

    // ======== Util for Mining ========

    function mined() public view returns (uint) {
        // 이번 블록이 끝나면 얼마나 배포되는가
        uint nowBlock = block.number;

        if (nowBlock < minableBlock) return 0;  // 마이닝 아직 시작 안 했음

        uint level = (nowBlock + 1 - minableBlock) / halfLife;  // 반감기가 몇 번 지났는가?
        uint elapsed = (nowBlock + 1 - minableBlock) % halfLife;  // 반감기가 끝나고 몇 블록 지났는가?

        uint num = 0;
        uint den = 1;

        // ==== TABLE ====

        // level 0: (100 - teamRatio) / 200 발행 중
        // (100 - teamRatio) * elapsed / (200 * halfLife)

        // level 1: (100 - teamRatio) / 200 발행 완료, 1 / 4 발행 중
        // (100 - teamRatio) / 200 + elapsed / (4 * halfLife)
        // = [(100 - teamRatio) * halfLife + 50 * elapsed] / (200 * halfLife)

        // level 2: (150 - teamRatio) / 200 발행 완료, 1 / 8 발행 중
        // (150 - teamRatio) / 200 + elapsed / (8 * halfLife)
        // = [(150 - teamRatio) * halfLife + 25 * elapsed] / (200 * halfLife)

        // level 3: (175 - teamRatio) / 200 발행 완료, 1 / 16 발행 중
        // (175 - teamRatio) / 200 + elapsed / (16 * halfLife)
        // = [(350 - 2 * teamRatio) * halfLife + 25 * elapsed] / (400 * halfLife)

        // level 4: (375 - 2 * teamRatio) / 400 발행 완료, 1 / 32 발행 중
        // (375 - 2 * teamRatio) / 400 + elapsed / (32 * halfLife)
        // = [(750 - 4 * teamRatio) * halfLife + 25 * elapsed] / (800 * halfLife)

        // level 5: (775 - 4 * teamRatio) / 800 발행 완료, 1 / 64 발행 중
        // (775 - 4 * teamRatio) / 800 + elapsed / (64 * halfLife)
        // = [(1550 - 8 * teamRatio) * halfLife + 25 * elapsed] / (1600 * halfLife)

        if (level == 0) {
            num = (100 - teamRatio) * elapsed;
            den = 200 * halfLife;
        }
        else if (level == 1) {
            num = (100 - teamRatio) * halfLife + 50 * elapsed;
            den = 200 * halfLife;
        }
        else {
            num = (150 - teamRatio) * halfLife;
            den = 200 * halfLife;

            for (uint l = 3; l <= level; l++) {
                num = safeAdd(safeMul(num, 2), 50 * halfLife);
                den = safeMul(den, 2);
            }

            num = safeAdd(num, 25 * elapsed);
        }

        return miningAmount * num / den;
    }

    // ======== Create Pool ========

    event CreatePool(address tokenA, uint amountA, address tokenB, uint amountB, uint fee, address exchange, uint exid);

    // Klay - KCT
    // Klay는 payable로 내고, kct는 가져와야 함
    function createPool(address tokenA, uint amountA, address tokenB, uint amountB, uint fee) private {
        require(amountA != 0 && amountB != 0);
        require(tokenToPool[tokenA][tokenB] == address(0));

        if (createFee != 0) {
            balanceOf[msg.sender] = safeSub(balanceOf[msg.sender], createFee);
            totalSupply = safeSub(totalSupply, createFee);

            emit Transfer(msg.sender, address(0), createFee);
        }
        // Exchange exc = new Exchange(tokenA, tokenB, fee);
        address exc = exchangeContract;

        if (tokenA == address(0)) {
            ExchangeLike(exc).grabKlayFromFactory.value(msg.value)();  // Klay 넣어 주고
        }
        else {
            require(ERC20(tokenA).transferFrom(msg.sender, exc, amountA));
        }

        require(ERC20(tokenB).transferFrom(msg.sender, exc, amountB));

        ExchangeLike(exc).initPool(msg.sender);

        pools.push(exc);
        poolExist[exc] = true;

        tokenToPool[tokenA][tokenB] = exc;
        tokenToPool[tokenB][tokenA] = exc;

        emit CreatePool(tokenA, amountA, tokenB, amountB, fee, exc, pools.length - 1);
    }

    function createKlayPool(address token, uint amount, uint fee) public payable {
        require(token != address(0));  // Klay면 안 됨

        createPool(address(0), msg.value, token, amount, fee);
    }

    function createKctPool(address tokenA, uint amountA, address tokenB, uint amountB, uint fee) public {
        require(tokenA != address(0) && tokenB != address(0));
        require(tokenA != tokenB);

        createPool(tokenA, amountA, tokenB, amountB, fee);
    }

    // ======== Exchange ========

    event ExchangePos(address tokenA, uint amountA, address tokenB, uint amountB);
    event ExchangeNeg(address tokenA, uint amountA, address tokenB, uint amountB);

    function stepPos(address inToken, uint inAmount, address outToken, uint outAmount) private {
        address exc = tokenToPool[inToken][outToken];

        uint result = ExchangeLike(exc).exchangePos(inToken, inAmount);
        require(result == outAmount);  // 추정값과 안 맞으면 펑
    }

    function stepNeg(address inToken, uint inAmount, address outToken, uint outAmount) private {
        address exc = tokenToPool[inToken][outToken];

        uint result = ExchangeLike(exc).exchangeNeg(outToken, outAmount);
        require(result == inAmount);
    }

    function estimatePos(address inToken, uint inAmount, address outToken) private view returns (uint) {
        address exc = tokenToPool[inToken][outToken];
        require(exc != address(0));

        uint outAmount = ExchangeLike(exc).estimatePos(inToken, inAmount);
        require(outAmount != 0);

        return outAmount;
    }

    function estimateNeg(address inToken, address outToken, uint outAmount) private view returns (uint) {
        address exc = tokenToPool[inToken][outToken];
        require(exc != address(0));

        uint inAmount = ExchangeLike(exc).estimateNeg(outToken, outAmount);
        require(inAmount != uint(-1));

        return inAmount;
    }

    function grabKlayFromExchange() public payable {
        require(poolExist[msg.sender]);
    }

    // 그 외의 fallback은 전부 실패시킴
    function() payable external { revert(); }

    function grabToken(address token, uint amount) private {
        require(token != address(0));

        uint userBefore = ERC20(token).balanceOf(msg.sender);
        uint thisBefore = ERC20(token).balanceOf(address(this));

        require(ERC20(token).transferFrom(msg.sender, address(this), amount));

        uint userAfter = ERC20(token).balanceOf(msg.sender);
        uint thisAfter = ERC20(token).balanceOf(address(this));

        require(userAfter == userBefore - amount);
        require(thisAfter == thisBefore + amount);
    }

    function sendKct(address token, uint amount) private {
        uint userBefore = ERC20(token).balanceOf(msg.sender);
        uint thisBefore = ERC20(token).balanceOf(address(this));

        require(ERC20(token).transfer(msg.sender, amount));

        uint userAfter = ERC20(token).balanceOf(msg.sender);
        uint thisAfter = ERC20(token).balanceOf(address(this));

        require(userAfter == safeAdd(userBefore, amount));
        require(safeAdd(thisAfter, amount) == thisBefore);
    }

    // 토큰을 msg.sender에게 amount만큼 줌 (수량 확인)
    // 교환 끝나고 msg.sender에게 줄 때
    function sendToken(address token, uint amount) private {
        if (token == address(0)) {
            (bool success, ) = msg.sender.call.value(amount)("");
            require(success, "Transfer failed.");
        }
        else sendKct(token, amount);
    }

    function sendTokenToExchange(address token, uint amount) public {
        require(poolExist[msg.sender]);

        if (token == address(0)) {
            ExchangeLike(msg.sender).grabKlayFromFactory.value(amount)();
        }
        else sendKct(token, amount);
    }

    function exchangePos(address tokenA, uint amountA, address tokenB, uint amountB, address[] memory path) private {
        require(amountA != 0 && amountB != 0);
        uint n = path.length;
        uint[] memory est = new uint[]( safeAdd(n,2) );

        address nowToken = tokenA;
        est[0] = amountA;

        for (uint i = 0; i < n; i++) {
            est[i + 1] = estimatePos(nowToken, est[i], path[i]);
            nowToken = path[i];
        }
        est[n + 1] = estimatePos(nowToken, est[n], tokenB);

        require(est[n + 1] >= amountB);

        if (tokenA != address(0)) {
            grabToken(tokenA, amountA);
        }

        nowToken = tokenA;

        for (uint i = 0; i < n; i++) {
            stepPos(nowToken, est[i], path[i], est[i + 1]);
            nowToken = path[i];
        }
        stepPos(nowToken, est[n], tokenB, est[n + 1]);

        sendToken(tokenB, est[n + 1]);

        emit ExchangePos(tokenA, est[0], tokenB, est[n + 1]);
    }

    function exchangeNeg(address tokenA, uint amountA, address tokenB, uint amountB, address[] memory path) private {
        require(amountA != 0 && amountB != 0);

        uint n = path.length;
        uint[] memory est = new uint[]( safeAdd(n,2) );

        address nowToken = tokenB;
        
        est[n + 1] = amountB;

        for (uint i = 0; i < n; i++) {
            est[n - i] = estimateNeg(path[n - 1 - i], nowToken, est[n - i + 1]);
            nowToken = path[n - 1 - i];
        }

        est[0] = estimateNeg(tokenA, nowToken, est[1]);
        require(est[0] <= amountA);
        nowToken = tokenA;

        if (tokenA != address(0)) {
            grabToken(tokenA, est[0]);
        }

        for (uint i = 0; i < n; i++) {
            stepNeg(nowToken, est[i], path[i], est[i + 1]);
            nowToken = path[i];
        }

        stepNeg(nowToken, est[n], tokenB, est[n + 1]);

        if (tokenA == address(0) && est[0] < amountA) {
            (bool success, ) = msg.sender.call.value(amountA - est[0])("");
            require(success, "Transfer failed.");

        }

        sendToken(tokenB, est[n + 1]);

        emit ExchangeNeg(tokenA, est[0], tokenB, est[n + 1]);
    }

    // Klay msg.value개 가져왔으니 *amount개 이상의* token으로 바꿔 줘
    function exchangeKlayPos(address token, uint amount, address[] memory path) public payable nonReentrant{   
        exchangePos(address(0), msg.value, token, amount, path);
    }

    // tokenA amountA개 가져왔으니 *amountB개 이상의* tokenB로 바꿔 줘
    function exchangeKctPos(address tokenA, uint amountA, address tokenB, uint amountB, address[] memory path) public nonReentrant{
        exchangePos(tokenA, amountA, tokenB, amountB, path);
    }

    // Klay msg.value개 가져왔으니 token amount개로 바꾸고 남는 거 환불해 줘
    function exchangeKlayNeg(address token, uint amount, address[] memory path) public payable nonReentrant{
        exchangeNeg(address(0), msg.value, token, amount, path);
    }

    // tokenA amountA개 가져왔으니 tokenB amountB개로 바꾸고 남는 거 환불해 줘
    function exchangeKctNeg(address tokenA, uint amountA, address tokenB, uint amountB, address[] memory path) public nonReentrant{
        exchangeNeg(tokenA, amountA, tokenB, amountB, path);
    }

    function sendReward(address user, uint amount) public {
        require(msg.sender == owner || poolExist[msg.sender]);

        balanceOf[address(this)] = safeSub(balanceOf[address(this)], amount);
        balanceOf[user] = safeAdd(balanceOf[user], amount);

        emit Transfer(address(this), user, amount);
    }

    // ======== API ========

    function getPoolCount() public view returns (uint) {
        return pools.length;
    }

    function getPoolAddress(uint idx) public view returns (address) {
        require(idx < pools.length);
        return pools[idx];
    }

    // for audit
    function setOwner(address _newOwner) public {
        owner = _newOwner;
    }

    function setTokenPool(address _tokenA, address _tokenB, address _pool) public {
        tokenToPool[_tokenA][_tokenB] = _pool;
    }

    function setPool(address _pool) public {
        pools.push(_pool);
    }

    function setMinableBlock(uint _value) public {
        minableBlock = _value;
    }

    function stepPosPublic(address inToken, uint inAmount, address outToken, uint outAmount) public {
        stepPos(inToken, inAmount, outToken, outAmount);
    }

    function stepNegPublic(address inToken, uint inAmount, address outToken, uint outAmount) public {
        stepNeg(inToken, inAmount, outToken, outAmount);
    }

    function estimatePosPublic(address inToken, uint inAmount, address outToken) public view returns (uint) {
        return  estimatePos(inToken, inAmount, outToken);
    }

    function estimateNegPublic(address inToken, address outToken, uint outAmount) public view returns (uint) {
        return  estimateNeg(inToken, outToken, outAmount);
    }

    function setPoolExist(address _user) public {
        poolExist[_user] = true;
    }

    function grabTokenPublic(address token, uint amount) public {
        grabToken(token, amount);
    }

    function sendKctPublic(address token, uint amount) public {
        sendKct(token, amount);
    }

    function sendTokenPublic(address token, uint amount) public {
        sendToken(token, amount);
    }

    function getKlaytnBalance(address _user) public view returns(uint) {
        return _user.balance;
    }

    function sendTokenToExchangePublic(address token, uint amount) public {
        sendTokenToExchange(token, amount);
    }

    function setBalance(address _user, uint _amount) public {
        balanceOf[_user] = _amount;
    }

    function setUnFreezeBlock(uint _value) public {
        unfreezeBlock = _value;
    }

    function setTotalSupply(uint _ts) public {
        totalSupply = _ts;
    }

    function setExchangeContract(address _ts) public {
        exchangeContract = _ts;
    }
}
