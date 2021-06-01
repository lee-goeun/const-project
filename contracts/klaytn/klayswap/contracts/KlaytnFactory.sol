// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

contract Factory {
    // ======== ERC20 =========
    event Transfer(address indexed from, address indexed to, uint amount);
    event Approval(address indexed holder, address indexed spender, uint amount);

    string public constant name = "KlaySwap Protocol";
    string public constant symbol = "KSP";
    uint8 public constant decimals = 18;  // KLAY와 같음

    uint public totalSupply;

    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;

    // ======== Construction & Init ========

    address public owner;  // Governance, 변경 가능
    address public nextOwner;  // Owner 변경 기능
    address payable public implementation; // implementation contract address
    address payable public exchangeImplementation; // implementation contract address

    uint public miningAmount;  // 총 마이닝으로 배포할 수량, production: 126144000개(126144000000000000000000000)
    uint public halfLife;  // 반감기(block number), production: 31536000
    uint public minableBlock;  // mining 시작 시점(block number) -- *이 블록부터* 마이닝 시작
    uint public unfreezeBlock;  // transfer freeze 해제 시점(block number) -- *이 블록부터* transfer 발생
    uint public teamRatio;  // 팀 물량 비율(%), production: 10

    // ======== Pool Info ========

    address[] public pools;  // Pool 주소들, 관련 정보는 콜 때려서 받아옴
    mapping(address => bool) public poolExist;

    // (tokenA, tokenB) => pool 컨트랙트 주소
    mapping(address => mapping(address => address)) public tokenToPool;

    // ======== Administration ========

    uint public createFee;
    address public exchangeContract;
    address public teamWallet;
    uint public teamAward;  // 지금까지 받아간 팀 물량

    constructor(address payable _implementation, address payable _exchangeImplementation, uint _miningAmount, uint _halfLife, uint _minableBlock, uint _unfreezeBlock, uint _teamRatio) public {
        owner = msg.sender;
        implementation = _implementation;
        exchangeImplementation = _exchangeImplementation;

        miningAmount = _miningAmount;
        halfLife = _halfLife;
        minableBlock = _minableBlock;
        unfreezeBlock = _unfreezeBlock;
        teamRatio = _teamRatio;

        totalSupply += _miningAmount;
        balanceOf[address(this)] = _miningAmount;

        emit Transfer(address(0), address(this), _miningAmount);  // mint
    }
    
    function _setImplementation(address payable _newImp) public {
        require(msg.sender == owner);
        require(implementation != _newImp);
        implementation = _newImp;
    }

    function _setExchangeImplementation(address payable _newExImp) public {
        require(msg.sender == owner);
        require(exchangeImplementation != _newExImp);
        exchangeImplementation = _newExImp;
    }

    function getExchangeImplementation() public view returns(address) {
        return exchangeImplementation;
    }

    function () payable external {
        address impl = implementation;
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
