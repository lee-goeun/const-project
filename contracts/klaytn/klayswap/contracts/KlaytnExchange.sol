// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

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

contract ERC20 {
    function symbol() public view returns (string memory);
    function decimals() public view returns (uint8);

    function balanceOf(address) public view returns (uint);

    function transfer(address, uint) public returns (bool);
    function transferFrom(address, address, uint) public returns (bool);
}

contract FactoryLikeImpl {
    function getExchangeImplementation() public view returns(address);
}

contract Exchange is SafeMath {
    // ======== ERC20 =========

    event Transfer(address indexed from, address indexed to, uint amount);
    event Approval(address indexed holder, address indexed spender, uint amount);

    string public name = "KlaySwap LP";  // 발행되고 나서 뒤에 토큰 이름 붙음
    string public constant symbol = "KSLP";
    uint8 public decimals = 18;  // 발행되고 나서 tokenA의 decimal 따름

    uint public totalSupply;

    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;

    address public factory;  // 사실상의 owner, 변경 불가
    address public treasury;
    address public kaiAdminC;
    address public governance;

    address public tokenA;
    address public tokenB;

    uint public fee;  // 0.01% 단위, 즉 분모 10000

    // ======== Construction & Init ========
    // construct -> 토큰 전송 -> init
    constructor(address _tokenA, address _tokenB, uint _fee) public {
        factory = msg.sender;

        require(_tokenA != _tokenB);
        require(_tokenB != address(0));  // Klay가 낀다면 반드시 tokenA

        tokenA = _tokenA;
        tokenB = _tokenB;

        require(_fee <= 100);  // 0% ~ 1%
        fee = _fee;
    }

    // Mining rate: 마이닝 수량 중에 mining / 100 을 가져감
    uint public mining;

    // 마지막으로 확인한 블록까지 마이닝으로 풀린 물량
    uint public lastMined;
    uint public miningIndex;  // 1LP당 가치 * 10 ** 18

    mapping(address => uint) public userLastIndex;  // 유저가 보상을 받아간 시점의 인덱스
    mapping(address => uint) public userRewardSum;  // 유저의 누적 보상
    
    function () payable external {
        address impl = FactoryLikeImpl(factory).getExchangeImplementation();
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
