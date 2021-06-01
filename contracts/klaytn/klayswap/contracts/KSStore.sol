// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract FactoryLike {
	mapping(address => bool) public poolExist;
}

contract KSStore {
	bool private _entered;
	address public factory;

	constructor (address _factory) public{
		factory = _factory;
        _entered = false;
    }

    modifier onlyKlayswap() {
    	require(msg.sender == factory || FactoryLike(factory).poolExist(msg.sender), "msg.sender is not klayswap contract");
    	_;
    }

    function setEntered() public onlyKlayswap {
    	_entered = true;
    }

	function setNotEntered() public onlyKlayswap {
    	_entered = false;
    }   

    function isEntered() public view returns (bool) {
        return _entered;
    } 
    
}