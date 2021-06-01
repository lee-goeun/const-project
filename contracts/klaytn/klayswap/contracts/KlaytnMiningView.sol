// SPDX-License-Identifier: MIT

pragma solidity ^0.5.0;

contract Factory {
    function getPoolCount() public view returns (uint);
    function getPoolAddress(uint) public view returns (address);
}

contract Exchange {
    function tokenA() public view returns (address);
    function tokenB() public view returns (address);
    function fee() public view returns (uint);

    function totalSupply() public view returns (uint);
    function getCurrentPool() public view returns (uint, uint);

    function miningIndex() public view returns (uint);
    function lastMined() public view returns (uint);
    function mining() public view returns (uint);

    function balanceOf(address) public view returns (uint);
    function userRewardSum(address) public view returns (uint);
    function userLastIndex(address) public view returns (uint);
}

contract FactoryView {
    string public constant version = "1025";

    Factory public factory;

    constructor(address _factory) public {
        factory = Factory(_factory);
    }

    function getPoolCount() public view returns (uint) {
        return factory.getPoolCount();
    }

    // [si, ei)
    function getFixedData(uint si, uint ei) public view returns (address[] memory, address[] memory, address[] memory, uint[] memory) {
        require(si < ei);

        uint n = ei - si;

        address[] memory exchanges = new address[](n);
        address[] memory tokenAs = new address[](n);
        address[] memory tokenBs = new address[](n);
        uint[] memory fees = new uint[](n);

        for(uint i = 0; i < n; i++) {
            Exchange exc = Exchange(factory.getPoolAddress(si + i));

            exchanges[i] = address(exc);
            tokenAs[i] = exc.tokenA();
            tokenBs[i] = exc.tokenB();
            fees[i] = exc.fee();
        }

        return (exchanges, tokenAs, tokenBs, fees);
    }

    function getAmountData(uint si, uint ei) public view returns (uint[] memory, uint[] memory, uint[] memory) {
        require(si < ei);

        uint n = ei - si;

        uint[] memory supplies = new uint[](n);
        uint[] memory amountAs = new uint[](n);
        uint[] memory amountBs = new uint[](n);

        for(uint i = 0; i < n; i++) {
            Exchange exc = Exchange(factory.getPoolAddress(si + i));

            supplies[i] = exc.totalSupply();
            (amountAs[i], amountBs[i]) = exc.getCurrentPool();
        }

        return (supplies, amountAs, amountBs);
    }

    function getMiningData(uint si, uint ei) public view returns (uint[] memory, uint[] memory, uint[] memory) {
        require(si < ei);

        uint n = ei - si;

        uint[] memory indexes = new uint[](n);
        uint[] memory mineds = new uint[](n);
        uint[] memory minings = new uint[](n);

        for(uint i = 0; i < n; i++) {
            Exchange exc = Exchange(factory.getPoolAddress(si + i));

            indexes[i] = exc.miningIndex();
            mineds[i] = exc.lastMined();
            minings[i] = exc.mining();
        }

        return (indexes, mineds, minings);
    }

    function getUserData(address user, uint si, uint ei) public view returns (uint[] memory, uint[] memory, uint[] memory) {
        require(si < ei);

        uint n = ei - si;

        uint[] memory liquis = new uint[](n);
        uint[] memory rewards = new uint[](n);
        uint[] memory indexes = new uint[](n);

        for(uint i = 0; i < n; i++) {
            Exchange exc = Exchange(factory.getPoolAddress(si + i));

            liquis[i] = exc.balanceOf(user);
            rewards[i] = exc.userRewardSum(user);
            indexes[i] = exc.userLastIndex(user);
        }

        return (liquis, rewards, indexes);
    }
}
