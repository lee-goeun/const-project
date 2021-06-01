// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;
import 'hardhat/console.sol';
library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;

        return c;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
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

contract Factory {
    using SafeMath for uint256;

    mapping (address => mapping (address => uint256)) private _allowances;

    uint256 private _totalSupply;
    bool public sendRewardParam = false;
    bool public changeMiningRateParam = false;
    bool public sendTokenToExchangeParam = false;

    address public cnAddress;
    address public tokenAddress;

    mapping (address => uint256) private _balances;
    address public owner;
    address public nextOwner;
    address public exchangeImplementation;
    address public implementation;
    address public sendRewardUser;

    uint public sendRewardAmount = 0;
    uint public mineRate = 0;
    uint public mined = 0;
    uint public unfreezeBl = 10;

    function exchangeKlayPos(address token, uint amount, address[] memory path) public payable {
        exchangePos(address(0), msg.value, token, amount, path);
    }

    function exchangePos(address tokenA, uint amountA, address tokenB, uint amountB, address[] memory path) private {

        uint n = 2;
        uint[] memory est = new uint[](2);

        address nowToken = tokenA;
        est[0] = amountA;
        est[1] = amountB;

    }

    function exchangeKctPos(address tokenA, uint amountA, address tokenB, uint amountB, address[] memory path) public {

        uint n = 2;
        uint[] memory est = new uint[](2);

        address nowToken = tokenA;
        est[0] = amountA;
        est[1] = amountB;

    }


    function unfreezeBlock() public view returns(uint) {
        return unfreezeBl;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function setOwner(address _newOwner) public {
        owner = _newOwner;
    }

    function setNextOwner(address _newOwner) public {
        nextOwner = _newOwner;
    }

    function changeOwner() public {
        owner = nextOwner;
    }

    function _setExchangeImplementation(address _exchangeImpl) public {
        exchangeImplementation = _exchangeImpl;
    }

    function _setImplementation(address _factoryImpl) public {
        implementation = _factoryImpl;
    }

    function sendReward(address _user, uint _amount) public {
        sendRewardParam = true;
        sendRewardUser = _user;
        sendRewardAmount = _amount;
    }

    function changeMiningRate(address[] memory _tokenAs, address[] memory _tokenBs, uint[] memory rates) public {
        changeMiningRateParam = true;
        mineRate = rates[1];
    }

    function sendMined(uint _mined) public {
        mined = _mined;
    }

    function mint(address account, uint256 amount) public returns (bool) {
        _mint(account, amount);
        return true;
    }

    function _mint(address account, uint256 amount) internal {
        _totalSupply = _totalSupply.add(amount);
        _balances[account] = _balances[account].add(amount);
    }

    function addKlayLiquidity(uint256 amount) public payable {
        amount-1;
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal {
        _balances[sender] = _balances[sender].sub(amount);
        _balances[recipient] = _balances[recipient].add(amount);
    }

    function getPoolCount() public view returns (uint) {
        return 1;
    }

    function getPoolAddress(uint _index) public view returns (address) {
        return tokenAddress;
    }

    function setTokenAddress(address _token) public {
        tokenAddress = _token;
    }

    function setUnfreezeBlock(uint _block) public {
        unfreezeBl = _block;
    }

    function sendTokenToExchange(address token, uint amount) public {
        sendTokenToExchangeParam = true;
    }
}