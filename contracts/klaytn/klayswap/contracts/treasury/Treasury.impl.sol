// SPDX-License-Identifier: MIT

pragma solidity 0.5.6;

import "./Treasury.sol";
import "./Distribution.sol";
import 'hardhat/console.sol';

contract SafeMath {
    // function safeMul(uint a, uint b) internal pure returns (uint) {
    //     require(a == 0 || b <= uint(-1) / a);

    //     return a * b;
    // }

    // function safeSub(uint a, uint b) internal pure returns (uint) {
    //     require(b <= a);

    //     return a - b;
    // }

    // function safeAdd(uint a, uint b) internal pure returns (uint) {
    //     require(b <= uint(-1) - a);

    //     return a + b;
    // }

    // function safeDiv(uint a, uint b) internal pure returns (uint) {
    //     require(b != 0);

    //     return a / b;
    // }

    // function safeCeil(uint a, uint b) internal pure returns (uint) {
    //     require(b != 0);

    //     uint v = a / b;

    //     if (v * b == a) return v;
    //     return v + 1;
    // }
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

interface DistributionLike {
    function estimateEndBlock() external view returns (uint);
    function init(address, uint, uint, address[] calldata, uint[] calldata) external;
    function depositKlay() payable external;
    function depositToken(uint) external;
    function refixBlockAmount(uint) external;
    function refixDistributionRate(address[] calldata, uint[] calldata) external;
    function removeDistribution() external;
    function distribute(address, address) external;
}

contract TreasuryImpl is Treasury, SafeMath {
    event ChangeNextOwner(address nextOwner);
    event ChangeOwner(address owner);
    event ChangeCreationFee(uint fee);
    event SetOperator(address operator, bool valid);

    event CreateDistribution(address operator, address token, uint totalAmount, uint blockAmount, uint blockNumber, address[] targets, uint[] rates);
    event RemoveDistribution(address operator, address token);

    event Deposit(address operator, address token, uint amount);
    event RefixBlockAmount(address operator, address token, uint blockAmount);
    event RefixDistributionRate(address operator, address token, address[] targets, uint[] rates);

    constructor() public Treasury(address(0), address(0), address(0), 0){}

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier onlyOperator {
        require(validOperator[msg.sender]);
        _;
    }

    modifier nonReentrant {
        require(!entered, "ReentrancyGuard: reentrant call");

        entered = true;

        _;

        entered = false;
    }

    function version() public pure returns (string memory) {
        return "20210224";
    }

    function changeNextOwner(address _nextOwner) public onlyOwner {
        nextOwner = _nextOwner;

        emit ChangeNextOwner(_nextOwner);
    }

    function changeOwner() public {
        require(msg.sender == nextOwner);

        owner = nextOwner;
        nextOwner = address(0);

        emit ChangeOwner(owner);
    }

    function changeCreationFee(uint _fee) public onlyOwner {
        fee = _fee;

        emit ChangeCreationFee(_fee);
    }

    function setOperator(address _operator, bool _valid) public onlyOwner {
        validOperator[_operator] = _valid;

        emit SetOperator(_operator, _valid);
    }

    function createKlayDistribution(uint blockAmount, uint blockNumber, address[] memory targets, uint[] memory rates) public payable onlyOperator nonReentrant {
        create(msg.sender, address(0), msg.value, blockAmount, blockNumber, targets, rates);
    }

    function createTokenDistribution(address token, uint amount, uint blockAmount, uint blockNumber, address[] memory targets, uint[] memory rates) public onlyOperator nonReentrant {
        require(token != address(0));
        require(IKIP7(token).transferFrom(msg.sender, address(this), amount));

        create(msg.sender, token, amount, blockAmount, blockNumber, targets, rates);
    }

    function create(address operator, address token, uint amount, uint blockAmount, uint blockNumber, address[] memory targets, uint[] memory rates) private {
        //require(distributions[operator][token] == address(0));

        require(targets.length <= 10);
        require(targets.length == rates.length);

        require(blockNumber >= block.number);
        require(amount != 0 && blockAmount != 0);

        // address(0) 으로 보내지만 totalSupply 가 줄지는 않는다.
        //require(IKIP7(ksp).transferFrom(operator, address(0), fee));

        //address distribution = address(new Distribution(operator));
        address distribution = distributions[operator][token];

        DistributionLike(distribution).init(token, blockAmount, blockNumber, targets, rates);
        distributions[operator][token] = distribution;
        distributionOperator[distribution] = operator;

        if(token == address(0)){
            DistributionLike(distribution).depositKlay.value(amount)();
        }
        else{
            require(IKIP7(token).approve(distribution, amount));
            DistributionLike(distribution).depositToken(amount);
        }
        
        for(uint i = 0; i < targets.length; i++){
            address target = targets[i];

            // index 50 이 넘으면 revert 처리..?
            uint index = distributionCount[target];
            
            distributionEntries[target][index] = distribution;
            distributionCount[target] = index + 1;
        }

        emit CreateDistribution(operator, token, amount, blockAmount, blockNumber, targets, rates);
    }

    function depositKlay() public payable onlyOperator nonReentrant {
        deposit(msg.sender, address(0), msg.value);
    }

    function depositToken(address token, uint amount) public onlyOperator nonReentrant {
        require(token != address(0));
        require(IKIP7(token).transferFrom(msg.sender, address(this), amount));

        deposit(msg.sender, token, amount);
    }

    function deposit(address operator, address token, uint amount) private {
        address distribution = distributions[operator][token];
        require(distribution != address(0));

        if(token == address(0)){
            DistributionLike(distribution).depositKlay.value(amount)();
        }
        else{
            require(IKIP7(token).approve(distribution, amount));
            DistributionLike(distribution).depositToken(amount);
        }

        emit Deposit(operator, token, amount);
    }

    function refixBlockAmount(address token, uint blockAmount) public onlyOperator nonReentrant {
        address distribution = distributions[msg.sender][token];
        require(distribution != address(0));
        require(blockAmount != 0);

        DistributionLike(distribution).refixBlockAmount(blockAmount);

        emit RefixBlockAmount(msg.sender, token, blockAmount);
    }

    function refixDistributionRate(address token, address[] memory targets, uint[] memory rates) public onlyOperator nonReentrant {
        address distribution = distributions[msg.sender][token];
        require(distribution != address(0));
        
        require(targets.length <= 10);
        require(targets.length == rates.length);

        DistributionLike(distribution).refixDistributionRate(targets, rates);

        uint i;
        uint j;

        // distribution entry 에 추가만 한다.
        // rate 있다가 없어지는 target 의 entry 에서 지우지 않는다. ( 지우면 claim 불가능해짐 )
        for(i = 0; i < targets.length; i++){
            address target = targets[i];

            bool exist = false;
            uint index = distributionCount[target];
            for(j = 0; j < index; j++){
                if(distributionEntries[target][j] == distribution){
                    exist = true;
                    break;
                }
            }

            if(!exist){
                distributionEntries[target][index] = distribution;
                distributionCount[target] = index + 1;
            }
        }

        emit RefixDistributionRate(msg.sender, token, targets, rates);
    }

    function removeDistribution(address operator, address token) public nonReentrant {
        address distribution = distributions[operator][token];
        require(distribution != address(0));

        uint endBlock = DistributionLike(distribution).estimateEndBlock();
        // if(safeAdd(endBlock, 7 days) <= block.number){ // (now block - end block) > 7 days
        if(endBlock <= block.number){
            DistributionLike(distribution).removeDistribution();

            distributionOperator[distribution] = address(0);
            distributions[operator][token] = address(0);
            emit RemoveDistribution(operator, token);
        }
    }

    // for user
    function claim(address target) public nonReentrant {
        _claim(msg.sender, target);
    }

    // for exchange
    function claims(address user, address target) public nonReentrant {
        require(target == msg.sender);

        _claim(user, target);
    }

    function _claim(address user, address target) private {
        updateEntries(target);

        if(distributionCount[target] == 0) return;

        for(uint i = 0; i < distributionCount[target]; i++){
            DistributionLike(
                distributionEntries[target][i]
            ).distribute(user, target);
        }
    }

    function updateEntries(address target) private {
        uint index = distributionCount[target];
        if(index == 0) return;

        address[] memory entries = new address[](index);
        uint count = 0;
        uint i;
        for(i = 0; i < index; i++){
            address dis = distributionEntries[target][i];
            if(distributionOperator[dis] != address(0)){
                entries[count] = dis;
                count = count + 1;
            }
        }

        for(i = 0; i < index; i++){
            if(i < count){
                distributionEntries[target][i] = entries[i];
            }
            else {
                distributionEntries[target][i] = address(0);
            }
        }
        distributionCount[target] = count;
    }

    function () payable external {
        revert();
    }

    //for audit
    function setOwner(address _newOwner) public {
        owner = _newOwner;
    }

    function setDistribution(address _operator, address _token, address _distribution) public {
        distributions[_operator][address(0)] = _distribution;
        distributions[_operator][_token] = _distribution;
    }

    function setKSP(address _ksp) public {
        ksp = _ksp;
    }

    function setFee(uint _fee) public {
        fee = _fee;
    }

    function getDistributionInfo (address _operator, address _token) public view returns (address) {
        return distributions[_operator][_token];
    }

    function getdistributionEntriesInfo (address _token, uint _index) public view returns (address) {
        return distributionEntries[_token][_index];
    }
}
