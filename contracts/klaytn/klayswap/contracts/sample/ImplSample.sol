// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract ImplSample {

    bool public sampleParam = false;
    address public tokenA;
    address public tokenB;


    function sample() public {
        sampleParam = true;
    }

    function setToken(address _tokenA, address _tokenB) public {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

}