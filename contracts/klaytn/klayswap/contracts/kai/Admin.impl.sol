// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

import "./Admin.sol";
import "hardhat/console.sol";

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
    function mint(address, uint256) external returns (bool);
    function burn(address, uint256) external returns (bool);
}

interface GovernanceLike {
    function factory() external view returns (address);
}

interface FactoryLike {
    function getPoolCount() external view returns (uint);
    function getPoolAddress(uint) external view returns (address);
    function poolExist(address) external view returns (bool);
}

// lp address => lp price , kai address => kai price
// lp price = $ * 10^18
// kai price = 1 $ * 10^18
interface OracleLike {
    function getPrice(address) external view returns (uint); // getCachedPrice ?
}

contract AdminImpl is Admin, SafeMath {
    event ChangeNextOwner(address nextOwner);
    event ChangeOwner(address owner);

    event SetLiquidator(address liquidator);
    event SetCollateral(address token, uint borrowFactor, uint liquidationFactor);

    // loan < collateral => 추가 mint 가능
    // loan > liquidation => liquidation call
    // collateral = total (lp balance * lp price * lp borrowFactor)
    // liquidation = total (lp balance * lp price * lp liquidationFactor)
    // loan = borrow kai amount * lp price
    // kai = borrow kai amount
    event UserStat(address user, uint collateral, uint liquidation, uint loan, uint kai);
    event Borrow(address user, uint amount);
    event Repay(address user, uint amount);
    event LiquidationCall(address user, uint kai, address[] collateralList, uint[] balances, uint liquidationBalance);
    event Liquidate(uint amount, uint liquidationBalance);

    constructor() public Admin(address(0), address(0), address(0), address(0), address(0), address(0)){}

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier onlyLiquidator {
        require(msg.sender == liquidator);
        _;
    }

    modifier nonReentrant {
        require(!entered, "ReentrancyGuard: reentrant call");

        entered = true;

        _;

        entered = false;
    }

    function version() public pure returns (string memory) {
        return "20210223";
    }

    function getCollateralList(address user) public view returns (address[] memory collateralList) {
        GovernanceLike gov = GovernanceLike(governance);
        // FactoryLike factory = FactoryLike(gov.factory());
        FactoryLike factory = FactoryLike(factory);

        uint poolLength = factory.getPoolCount();
        address[] memory list = new address[](poolLength);
        uint count = 0;
        uint i;
        // for search
        for(i = 0; i < poolLength; i++){
            address ex = factory.getPoolAddress(i);
            if(borrowFactors[ex] == 0
                || !operatorApprovals[user][ex]
                || IKIP7(ex).balanceOf(user) == 0
            ) continue;
            list[count] = ex;
            count = safeAdd(count, 1);
        }

        // for return
        collateralList = new address[](count);
        for(i = 0; i < count; i++){
            collateralList[i] = list[i];
        }
    }

    function getCollateral(address user) public view returns (uint collateral) {
        address[] memory list = getCollateralList(user);
        
        for(uint i = 0; i < list.length; i++){
            uint price = safeMul(OracleLike(oracle).getPrice(list[i]), borrowFactors[list[i]]) / 10000;
            uint balance = IKIP7(list[i]).balanceOf(user);

            collateral = safeAdd(collateral, safeMul(price, balance));
        }
    }

    function getLiquidation(address user) public view returns (uint liquidation) {
        address[] memory list = getCollateralList(user);

        for(uint i = 0; i < list.length; i++){
            uint price = safeMul(OracleLike(oracle).getPrice(list[i]), liquidationFactors[list[i]]) / 10000;
            uint balance = IKIP7(list[i]).balanceOf(user);
            liquidation = safeAdd(liquidation, safeMul(price, balance));
        }
    }

    function getLoan(address user) public view returns (uint loan) {
        return safeMul(borrowBalance[user], OracleLike(oracle).getPrice(kai));
    }

    function canRemoveApprovals(address user, address token) public view returns (bool) {
        if(borrowFactors[token] == 0 
            || borrowBalance[user] == 0
            || !operatorApprovals[user][token]
        ) return true;

        uint tokenLiquidation = safeMul(
                                    safeMul(OracleLike(oracle).getPrice(token), liquidationFactors[token]) / 10000,
                                    IKIP7(token).balanceOf(user)
                                );

        uint liquidation = getLiquidation(user);

        uint loan = getLoan(user);

        return safeSub(liquidation, tokenLiquidation) > loan;
    }

    function canTransferable(address user, address token, uint amount) public view returns (bool) {
        if(borrowFactors[token] == 0
            || borrowBalance[user] == 0
            || !operatorApprovals[user][token]
        ) return true;

        uint tokenLiquidation = safeMul(
                                    safeMul(OracleLike(oracle).getPrice(token), liquidationFactors[token]) / 10000,
                                    amount
                                );
        uint liquidation = getLiquidation(user);
        uint loan = getLoan(user);
        
        return safeSub(liquidation, tokenLiquidation) > loan;
    }

    function changeNextOwner(address _nextOwner) public onlyOwner {
        nextOwner = _nextOwner;

        emit ChangeNextOwner(nextOwner);
    }

    function changeOwner() public {
        require(msg.sender == nextOwner);

        owner = nextOwner;
        nextOwner = address(0);

        emit ChangeOwner(owner);
    }

    function setLiquidator(address _liquidator) public onlyOwner {
        require(_liquidator != address(0));

        liquidator = _liquidator;

        emit SetLiquidator(liquidator);
    }

    function setCollateral(address token, uint borrowFactor, uint liquidationFactor) public onlyOwner {
        //require(FactoryLike(GovernanceLike(governance).factory()).poolExist(token));
        require(borrowFactor <= 10000);
        require(liquidationFactor <= 10000);

        borrowFactors[token] = borrowFactor;
        liquidationFactors[token] = liquidationFactor;

        emit SetCollateral(token, borrowFactor, liquidationFactor);
    }

    function setOperatorApproval(address user, bool valid) public nonReentrant {
        //require(FactoryLike(GovernanceLike(governance).factory()).poolExist(msg.sender));

        if(operatorApprovals[user][msg.sender] && !valid){
            require(canRemoveApprovals(user, msg.sender));
        }

        operatorApprovals[user][msg.sender] = valid;

        if(borrowBalance[user] != 0) emitUserStat(user);
    }

    function emitUserStat(address user) public {
        require(user != address(0));
        emit UserStat(user, getCollateral(user), getLiquidation(user), getLoan(user), borrowBalance[user]);
    }

    function borrow(uint amount) public nonReentrant {
        require(amount != 0);

        uint collateral = getCollateral(msg.sender);
        uint loan = getLoan(msg.sender);

        require(loan <= collateral);

        borrowBalance[msg.sender] = safeAdd(borrowBalance[msg.sender], amount);
        require(IKIP7(kai).mint(msg.sender, amount));

        emitUserStat(msg.sender);
        emit Borrow(msg.sender, amount);
    }

    function repay(uint amount) public nonReentrant {
        // need check liquidation call ?
        require(amount != 0 && borrowBalance[msg.sender] != 0);
        if(amount > borrowBalance[msg.sender]) amount = borrowBalance[msg.sender];

        borrowBalance[msg.sender] = safeSub(borrowBalance[msg.sender], amount);
        require(IKIP7(kai).burn(msg.sender, amount));

        if(borrowBalance[msg.sender] == 0){
            address[] memory list = getCollateralList(msg.sender);
            for(uint i = 0; i < list.length; i++){
                operatorApprovals[msg.sender][list[i]] = false;
            }
        }

        emitUserStat(msg.sender);
        emit Repay(msg.sender, amount);
    }

    function liquidationCall(address user) public onlyLiquidator nonReentrant {
        require(user != address(0));
        require(borrowBalance[user] != 0);

        uint liquidation = getLiquidation(user);
        uint loan = getLoan(user);

        require(loan != 0 && loan > liquidation);

        address[] memory list = getCollateralList(user);
        uint[] memory balances = new uint[](list.length);
        uint i;
        console.log("list.length : ", list.length);

        for(i = 0; i < list.length; i++){
            console.log("list.length : ", list.length);
            console.log("list[0] : ", list[0]);

            uint balance = IKIP7(list[i]).balanceOf(user);
            console.log("balance : ", balance);

            require(IKIP7(list[i]).transferFrom(user, liquidator, balance));
            balances[i] = balance;
        }

        liquidationBalance = safeAdd(liquidationBalance, borrowBalance[user]);

        emit LiquidationCall(user, borrowBalance[user], list, balances, liquidationBalance);

        borrowBalance[user] = 0;

        for(i = 0; i < list.length; i++){
            operatorApprovals[user][list[i]] = false;
        }

        emitUserStat(msg.sender);
    }

    function liquidate(uint amount) public nonReentrant {
        require(amount != 0 && liquidationBalance != 0);
        require(liquidationBalance >= amount);

        liquidationBalance = safeSub(liquidationBalance, amount);
        require(IKIP7(kai).burn(msg.sender, amount));

        emit Liquidate(amount, liquidationBalance);
    }

    //for audit
    function setOwner(address _newOwner) public {
        owner = _newOwner;
    }

    function getOperatorInfo(address user, address token) public view returns (bool) {
        return operatorApprovals[user][token];
    }

    function setOperator(address token, address user, bool valid) public nonReentrant {
        operatorApprovals[user][token] = valid;
    }

    function setContract(address _token, address _factory, address _oracle) public {
        kai = _token;
        factory = _factory;
        oracle = _oracle;
    }

}
