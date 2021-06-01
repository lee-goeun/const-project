// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

import "./Distribution.sol";
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

    // function safeDiv(uint a, uint b) internal pure returns (uint) {
    //     require(b != 0);

    //     return a / b;
    // }

    function safeCeil(uint a, uint b) internal pure returns (uint) {
        require(b != 0);

        uint v = a / b;

        if (v * b == a) return v;
        // return v + 1;
    }
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


// IKIP7 ( ERC20 ) 을 지키는 token 만 가능 ( return bool )
contract DistributionImpl is Distribution, SafeMath {
    event Initialized(address token, uint amountPerBlock, uint distributableBlock, address[] targets, uint[] rates);
    event Deposit(uint amount, uint totalAmount);
    event RefixBlockAmount(uint amountPerBlock);
    event RefixDistributionRate(address[] targets, uint[] rates);

    event ChangeDistributionRate(address target, uint rate);
    event UpdateDistributionIndex(address target, uint distributed, uint distributionIndex);
    event Distribute(address user, address target, uint amount, uint currentIndex, uint userRewardSum);

    constructor() public Distribution(address(0)){}

    modifier onlyTreasury {
        require(msg.sender == treasury);
        _;
    }

    modifier nonReentrant {
        require(!entered, "ReentrancyGuard: reentrant call");

        entered = true;

        _;

        entered = false;
    }

    function version() public pure returns (string memory) {
        return "20210219";
    }

    function estimateEndBlock() public view returns (uint) {
        return safeAdd(
            distributableBlock, 
            safeCeil(
                safeSub(totalAmount, distributedAmount),
                blockAmount
            )
        );
    }

    // Treasury 입금 & setting
    // 어떤 token, 얼마나, 언제부터, 블록당 몇개씩, target token list & rate 제출
    function init(address _token, uint _blockAmount, uint _blockNumber, address[] memory _targets, uint[] memory _rates) public onlyTreasury {
        require(!isInitialized);
        isInitialized = true;

        require(_blockAmount != 0);

        require(_blockNumber > block.number);
        require(_targets.length <= 10);
        require(_targets.length == _rates.length);
        token = _token;
        blockAmount = _blockAmount;
        distributableBlock = _blockNumber;
        distributedAmount = 0;

        changeDistributionRate(_targets, _rates);

        emit Initialized(_token, _blockAmount, _blockNumber, _targets, _rates);
    }

    function depositKlay() public payable onlyTreasury {
        require(token == address(0));

        deposit(msg.value);
    }

    function depositToken(uint amount) public onlyTreasury {
        require(token != address(0));
        require(IKIP7(token).transferFrom(treasury, address(this), amount));

        deposit(amount);
    }

    function deposit(uint amount) private {
        require(amount != 0);

        if(totalAmount != 0){ // init 에는 하지않는다.
            distributedAmount = distribution();
            distributableBlock = block.number;
        }

        totalAmount = safeAdd(totalAmount, amount);

        emit Deposit(amount, totalAmount);
    }

    function refixBlockAmount(uint _blockAmount) public onlyTreasury {
        require(_blockAmount != 0);

        // 지금 block 까지 oldBlockAmount 로 distribution index update
        for(uint i = 0; i < targetCount; i++){
            updateDistributionIndex(targetEntries[i]);
        }

        distributedAmount = distribution();
        blockAmount = _blockAmount;
        distributableBlock = block.number;

        emit RefixBlockAmount(blockAmount);
    }

    // distribution에 대한 rate config 조절
    function refixDistributionRate(address[] memory targets, uint[] memory rates) public onlyTreasury {
        require(totalAmount > distribution()); // 분배가 완료
        changeDistributionRate(targets, rates);

        emit RefixDistributionRate(targets, rates);
    }

    function changeDistributionRate(address[] memory targets, uint[] memory rate) private {
        uint n = targets.length;

        require(n <= 10);
        require(rate.length == n);
        uint i;
        uint j;
        uint rateSum = 0;
        for (i = 0; i < n; i++) {
            require(rate[i] != 0);
            rateSum = safeAdd(rateSum, rate[i]);

            for (j = 0; j < i; j++) {  // unique check
                require(targets[j] != targets[i]);
            }
        }
        require(rateSum == 100);  // 무조건 합이 100
        // 원래 rate가 있었는데 없어지는 애들
        for (i = 0; i < targetCount; i++) {
            address target = targetEntries[i];
            bool exist = false;

            for (j = 0; j < n; j++) {
                if (targets[j] == target) {
                    exist = true;
                    break;
                }
            }

            if (!exist) {
                setDistributionRate(target, 0);  // 각자 이벤트 + targetEntry에서 제거
            }
        }
        for (i = 0; i < n; i++) {
            if (distributionRate[targets[i]] != rate[i]) {
                setDistributionRate(targets[i], rate[i]);
            }
        }
    }

    // 불리고 나면 contract 에 남아있는 treasury 물량이 없어져서 claim 자체가 불가능해진다.
    // 남은 물량은 Treasury Contract Owner ( ozys ) 로 보낸다..?
    //      => draft : operator 로 전부 transfer
    function removeDistribution() public onlyTreasury {
        //require(safeAdd(estimateEndBlock(), 7 days) < block.number);

        uint balance = 0;
        if(token == address(0)){
            balance = (address(this)).balance;
            (bool res, ) = operator.call.value(balance)("");
            require(res);
        }
        else{
            balance = IKIP7(token).balanceOf(address(this));
            require(IKIP7(token).transfer(operator, balance));
        }
    }

    // ================================= Distribution =======================================

    function distribution() public view returns (uint){
        if(distributableBlock == 0 || distributableBlock > block.number) return distributedAmount;
        
        // distributable Block 부터 now block 까지 distribution amount
        // amount = distributedAmount + (nowBlock - distributableBlock) * amountPerBlock
        uint amount = safeAdd(
                        distributedAmount,
                        safeMul(
                            safeSub(
                                block.number,
                                distributableBlock
                            ), 
                            blockAmount
                        ));

        // amount > totalAmount ( treasury 넣어준 물량 ) = > return totalAmount,  분배가 끝난 상태
        return amount > totalAmount ? totalAmount : amount;
    }

    function setDistributionRate(address target, uint rate) private {
        require(rate <= 100);


        if(distributionRate[target] == 0 && rate != 0){ // 없다가 생기는 target
            require(targetCount < 10);

            targetEntries[targetCount] = target;
            targetCount = targetCount + 1;
        }

        if(rate == 0){ // 있다가 없어지는 target
            bool targetExist = false;
            uint targetIndex;

            for(uint i = 0; i < targetCount; i++){
                if(targetEntries[i] == target){
                    targetExist = true;
                    targetIndex = i;
                    break;
                }
            }
            require(targetExist);

            targetEntries[targetIndex] = targetEntries[targetCount - 1];
            targetEntries[targetCount - 1] = address(0);
            targetCount = targetCount - 1;
        }

        updateDistributionIndex(target);
        distributionRate[target] = rate;

        emit ChangeDistributionRate(target, rate);
    }

    function getDistributionIndex(address target) private view returns (uint) {
        uint distributed = distribution();

        if (distributed > lastDistributed[target]) {
            uint thisDistributed = safeMul(distributionRate[target], distributed - lastDistributed[target]) / 100;
            uint totalSupply = IKIP7(target).totalSupply();
            if (thisDistributed != 0 && totalSupply != 0) {
                return safeAdd(distributionIndex[target], safeMul(thisDistributed, 10 ** 18) / totalSupply);
            }
        }

        return distributionIndex[target];
    }

    function updateDistributionIndex(address target) public {
        uint distributed = distribution();
        if (distributed > lastDistributed[target]) {
            uint thisDistributed = safeMul(distributionRate[target], distributed - lastDistributed[target]) / 100;
            uint totalSupply = IKIP7(target).totalSupply();

            lastDistributed[target] = distributed;
            if (thisDistributed != 0 && totalSupply != 0) {
                distributionIndex[target] = safeAdd(distributionIndex[target], safeMul(thisDistributed, 10 ** 18) / totalSupply);
            }

            emit UpdateDistributionIndex(target, distributed, distributionIndex[target]);
        }
    }

    function distribute(address user, address target) public onlyTreasury nonReentrant {
        uint lastIndex = userLastIndex[target][user];
        uint currentIndex = getDistributionIndex(target);
        uint have = IKIP7(target).balanceOf(user);

        if (currentIndex > lastIndex) {
            userLastIndex[target][user] = currentIndex;
            if (have != 0) {
                uint amount = safeMul(have, currentIndex - lastIndex) / 10 ** 18;
                if(token == address(0)){
                    (bool result, ) = user.call.value(amount)("");
                    require(result);
                }
                else{
                    require(IKIP7(token).transfer(user, amount));
                }

                userRewardSum[target][user] = safeAdd(userRewardSum[target][user], amount);
                emit Distribute(user, target, amount, currentIndex, userRewardSum[target][user]);
            }
        }
    }

    function () payable external { revert(); }

    // for audit
    function setTreasury (address _treasury) public {
        treasury = _treasury;
    }

    function setOperator (address _treasury) public {
        operator = _treasury;
    }

    function setTargetCount (uint _targetCount) public {
        targetCount = _targetCount;
    }

    function getDistributionInfo (address target) public view returns (uint rate, uint index) {
        rate = distributionRate[target];
        index = distributionIndex[target];
    }

    function setDistributedAmount (uint _targetCount) public {
        distributedAmount = _targetCount;
    }

    function getUserLastIndex(address user, address target) public view returns (uint) {
        return  userLastIndex[target][user];
    }

    function getUserRewardSum(address user, address target) public view returns (uint) {
        return  userRewardSum[target][user];
    }

    function setDistributableBlock(uint _block) public {
        distributableBlock = _block;
    }

    function getDistributionIndexPublic(address target) public view returns (uint) {
        return getDistributionIndex(target);
    }

    function setLastDistributed (address _target, uint _targetCount) public {
        lastDistributed[_target] = _targetCount;
    }
}
