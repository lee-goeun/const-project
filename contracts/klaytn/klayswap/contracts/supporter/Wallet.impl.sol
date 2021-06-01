// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

import "./Wallet.sol";
import "hardhat/console.sol";

interface WalletLike {
    function grabLP(uint amount) external;
    function claimKSP(address user) external returns (uint);
    function claimToken(address user, address token) external returns (uint);
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

interface PoolLike{
    function claimReward() external;
}

interface SupporterImplLike {
    function poolContract() external view returns (address);
    function factoryContract() external view returns (address);
}

contract WalletImpl is Wallet, SafeMath, WalletLike {
    address public KSPToken;
    address public LPToken;

    constructor() public Wallet() {}

    modifier onlySupporter {
        require(msg.sender == supporterContract);
        _;
    }

    function _version() public pure returns (string memory) {
        return "20210223";
    }

    function grabLP(uint amount) external onlySupporter {
        IKIP7 LP = getLP();
        require(LP.balanceOf(address(this)) >= amount);

        require(LP.transfer(supporterContract, amount));
    }

    function claimKSP(address user) external onlySupporter returns (uint) {
        PoolLike pool = getPool();

        pool.claimReward();
        IKIP7 KSP = getKSP();
        uint balance = KSP.balanceOf(address(this));
        if(balance != 0){
            require(KSP.transfer(user, balance));
        }

        return balance;
    }

    function claimToken(address user, address token) external onlySupporter returns (uint) {
        require(token != address(getLP()));
        require(token != address(getKSP()));

        uint amount = 0;

        if(token == address(0)){
            amount = (address(this)).balance;
            require(amount != 0);
            (bool res,) = user.call.value(amount)("");
            require(res);
        }
        else{
            amount = IKIP7(token).balanceOf(address(this));
            require(amount != 0);
            require(IKIP7(token).transfer(user, amount));
        }

        return amount;
    }

    function getKSP() private view returns (IKIP7) {
        //return IKIP7(SupporterImplLike(supporterContract).factoryContract());
        return IKIP7(KSPToken);
    }

    function getLP() private view returns (IKIP7) {
        //return IKIP7(SupporterImplLike(supporterContract).poolContract());
        return IKIP7(LPToken);
    }

    function getPool() private view returns (PoolLike) {
        // return PoolLike(SupporterImplLike(supporterContract).poolContract());
        return PoolLike(poolContract);
    }

    function () external payable {}

    // for audit
    function setSupporter(address user) public {
        supporterContract = user;
    }

    function setKSPToken(address t) public {
        KSPToken = t;
    }

    function setLPToken(address t) public {
        LPToken = t;
    }

    function setPool(address t) public {
        poolContract = t;
    }

    function pay() public payable {

    }

    function getKlaytnBalance(address _t) public view returns(uint) {
        return _t.balance;
    }
}
