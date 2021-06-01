// SPDX-License-Identifier: MIT

  
pragma solidity 0.5.6;

import "./Store.sol";
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

interface ExchangeLike{
    function tokenA() external view returns (address);
    function tokenB() external view returns (address);
}

interface GovernanceLike{
    function factory() external view returns (address);
}

interface FactoryLike{
    function poolExist(address) external view returns (bool);
}

// a library for handling binary fixed point numbers (https://en.wikipedia.org/wiki/Q_(number_format))

// range: [0, 2**112 - 1]
// resolution: 1 / 2**112
library UQ112x112 {
    uint224 constant Q112 = 2**112;

    // encode a uint112 as a UQ112x112
    function encode(uint112 y) internal pure returns (uint224 z) {
        z = uint224(y) * Q112; // never overflows
    }

    // divide a UQ112x112 by a uint112, returning a UQ112x112
    function uqdiv(uint224 x, uint112 y) internal pure returns (uint224 z) {
        z = x / uint224(y);
    }
}

contract StoreImpl is Store {
    event Sync(address pool, uint112 reserveA, uint112 reserveB);

    using UQ112x112 for uint224;

    constructor() public Store(address(0), address(0)){}

    modifier nonReentrant {
        require(!entered, "ReentrancyGuard: reentrant call");

        entered = true;

        _;

        entered = false;
    }

    function version() public pure returns (string memory) {
        return "20210315";
    }

    function getReserves(address pool) public view returns (uint112 _reserveA, uint112 _reserveB, uint32 _blockTimestampLast) {
        _reserveA = reserveA[pool];
        _reserveB = reserveB[pool];
        _blockTimestampLast = blockTimestampLast[pool];
    }

    // update reserves and, on the first call per block, price accumulators
    function _update(address pool, uint balanceA, uint balanceB, uint112 _reserveA, uint112 _reserveB) private {
        require(balanceA <= uint112(-1) && balanceB <= uint112(-1), 'KLAYSwap: OVERFLOW');
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        uint32 timeElapsed = blockTimestamp - blockTimestampLast[pool]; // overflow is desired
        if (timeElapsed > 0 && _reserveA != 0 && _reserveB != 0) {
            // * never overflows, and + overflow is desired
            priceACumulativeLast[pool] += uint(UQ112x112.encode(_reserveB).uqdiv(_reserveA)) * timeElapsed;
            priceBCumulativeLast[pool] += uint(UQ112x112.encode(_reserveA).uqdiv(_reserveB)) * timeElapsed;
        }
        reserveA[pool] = uint112(balanceA);
        reserveB[pool] = uint112(balanceB);
        blockTimestampLast[pool] = blockTimestamp;
        emit Sync(pool, reserveA[pool], reserveB[pool]);
    }

    function update() public nonReentrant {
        // address factory = GovernanceLike(governance).factory();
        // require(FactoryLike(factory).poolExist(msg.sender));
        
        (uint112 _reserveA, uint112 _reserveB,) = getReserves(msg.sender);
        
        // ExchangeLike pool = ExchangeLike(msg.sender);
        ExchangeLike pool = ExchangeLike(poolContract);

        uint balanceA = 0;
        address tokenA = pool.tokenA();
        if(tokenA == address(0))
            balanceA = msg.sender.balance;
        else
            balanceA = IKIP7(tokenA).balanceOf(msg.sender);

        uint balanceB = IKIP7(pool.tokenB()).balanceOf(msg.sender);

        _update(msg.sender, balanceA, balanceB, _reserveA, _reserveB); 
    }


    function () payable external {
        revert();
    }

    function setContract(address _pool) public {
        poolContract = _pool;
    }
}