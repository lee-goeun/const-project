// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;
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

    function safeDiv(uint a, uint b) internal pure returns (uint) {
        require(b != 0);

        return a / b;
    }

    function safeCeil(uint a, uint b) internal pure returns (uint) {
        require(b != 0);

        uint v = a / b;

        if (v * b == a) return v;
        return v + 1;
    }
}

interface SupporterLike {
    function getWalletImplementation() external view returns(address);
}

contract Wallet {
    address public supporterContract;
    address public poolContract;

    constructor() public {
        supporterContract = msg.sender;
    }

    function () payable external {
        address impl = SupporterLike(supporterContract).getWalletImplementation();
        require(impl != address(0));
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize)
            let result := delegatecall(gas, impl, ptr, calldatasize, 0, 0)
            let size := returndatasize
            returndatacopy(ptr, 0, size)

            switch result
            case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }
}
