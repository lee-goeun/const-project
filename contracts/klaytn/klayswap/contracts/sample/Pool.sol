// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

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

contract Pool {
    using SafeMath for uint256;

    address public cnAddress;
    address public tokenA;
    address public tokenB;

    mapping (address => uint256) private _balances;

    mapping (address => mapping (address => uint256)) private _allowances;

    uint256 private _totalSupply;

    uint public ammountSample;

    bool public claimRewardParam = false;

    function getCurrentPool() external view returns (uint, uint) {
        return (100, 200);
    }

    function estimatePos(address token , uint amount) external view returns (uint) {
        return amount - 1;
    }

    // function addKlayLiquidity(uint amount) external payable {

    // }

    function removeLiquidity(uint amount) external {
        ammountSample = amount+1;
    }

    function userLastIndex(address) external view returns (uint) {
        return 100;
    }

    function userRewardSum(address) external view returns (uint) {
        return 101;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
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

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal {
        _balances[sender] = _balances[sender].sub(amount);
        _balances[recipient] = _balances[recipient].add(amount);
    }

    function setToken(address _tokenA, address _tokenB) public {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function claimReward() public {
        claimRewardParam = true;
    }
}
