const Web3 = require('web3');
const web3 = new Web3('https://bsc-dataseed1.binance.org:443'); //Mainnet
//Testnet : 'https://data-seed-prebsc-1-s1.binance.org:8545'

//venus 자체 api를 사용하기 위한 준비 입니다.
const fetch = require('node-fetch');
const options = {
  method: 'GET', 
  headers: {
    Accept: 'application/json', 
  }
};
const options_api = {
  method: 'GET', 
  headers: {
    'Accept': 'application/json', 
    'Content-Type': 'application/json'
  }
};

//klaytn과 다르게 smartcontract 코드에 대한 abi값을 직접 넣어 줘야합니다. 
//미리 다운 받아서 abi 폴더에 담아두고 가져와서 쓰면 됩니다.
const mainnet_abi = require('./abi/mainnet-abi.json');
const vbep20_delegator_abi = require('./abi/vbep20_delegator_abi.json');
const comptroller_abi = require('./abi/comptroller_abi.json');
const vai_vault_abi = require('./abi/vai_vault_abi.json');
const vai_comptroller_abi = require('./abi/vai_controller_abi.json');


const ABI_DELEGATOR =vbep20_delegator_abi;
const ABI_UNITROLLER = comptroller_abi;
const ABI_CLAIM_STAKED_VAI = vai_vault_abi;
const ABI_VENUSLENS = mainnet_abi.VenusLens;
const ABI_VAI_CONTROLLER = vai_comptroller_abi;


// const USER_ADDRESS = '0xe30d11D8f97755ef528e5Ff7a25296c528eE607A';

const CONTRACT_TOKEN_XVS = "0xB248a295732e0225acd3337607cc01068e3b9c10"; 
const CONTRACT_UNITROLLER ='0xfD36E2c2a6789Db23113685031d7F16329158384';
const CONTRACT_DELEGATOR = '0xf9f48874050264664bf3d383C7289a0a5BD98896';
const CONTRACT_DELEGATOR_XVS = '0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D';
const CONTRACT_TOKEN_VAI = '0x4BD17003473389A42DAF6a0a729f6Fdb328BbBd7';
const CONTRACT_VAIPROXY = '0x0667Eed0a0aAb930af74a3dfeDD263A73994f216';
const CONTRACT_VENUSLENS = "0x595e9DDfEbd47B54b996c839Ef3Dd97db3ED19bA"; 
const CONTRACT_VAI_CONTROLLER = '0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE';

/////////////////////////////////////////////////////////// only UST 가격조회를 위해 필요한부분
const UST_abi = require('./abi/UST_abi.json');
const BUSD_abi = require('./abi/BUSD_abi.json');
const ABI_UST = UST_abi;
const ABI_BUSD = BUSD_abi;

const CONTRACT_BUSDUST_LP = '0x05faf555522Fa3F93959F86B41A3808666093210';
/////////////////////////////////////////////////////////////////////////////////////

//불가피하게 미리 핢수를 정의 했습니다...
async function getAllMarkets(){
  const _getAllMarket = new web3.eth.Contract(ABI_UNITROLLER, CONTRACT_UNITROLLER);
  let all_asset_contract = await _getAllMarket.methods.getAllMarkets().call();
  return all_asset_contract;
};
async function getAssetsIn(USER_ADDRESS){
  const _getAssetIn = new web3.eth.Contract(ABI_UNITROLLER, CONTRACT_UNITROLLER);
  let asset_contract = await _getAssetIn.methods.getAssetsIn(USER_ADDRESS).call();
  return asset_contract;
};
async function balanceOfUnderlying(TOKEN_ADDRESS, USER_ADDRESS){
  let _balanceOfUnderlying = new web3.eth.Contract(ABI_DELEGATOR,TOKEN_ADDRESS);
  let balanceOfUnderlying = await _balanceOfUnderlying.methods.balanceOfUnderlying(USER_ADDRESS).call();// => supply한거 잔고
  return balanceOfUnderlying;
};
async function borrowBalanceCurrent(TOKEN_ADDRESS, USER_ADDRESS){
  let _borrowBalanceCurrent = new web3.eth.Contract(ABI_DELEGATOR, TOKEN_ADDRESS);
  let borrowBalanceCurrent = await _borrowBalanceCurrent.methods.borrowBalanceCurrent(USER_ADDRESS).call();// => borrow한거 잔고
  return borrowBalanceCurrent;
};
async function pendingXVS(USER_ADDRESS){
  const _pendingXVS = new web3.eth.Contract(ABI_CLAIM_STAKED_VAI, CONTRACT_VAIPROXY);
  let pendingXVS = await _pendingXVS.methods.pendingXVS(USER_ADDRESS).call();
  console.log(pendingXVS);
};
async function UserStaked(USER_ADDRESS){
  const UserStaked = new web3.eth.Contract(ABI_CLAIM_STAKED_VAI, CONTRACT_VAIPROXY);
  let userInfo = await UserStaked.methods.userInfo(USER_ADDRESS).call();
  return userInfo.amount;//user staked amount
};
async function balanceOf(USER_ADDRESS, TOKEN_ADDRESS){
  const _balanceOf = new web3.eth.Contract(ABI_DELEGATOR, TOKEN_ADDRESS);
  let balanceOf = await _balanceOf.methods.balanceOf(USER_ADDRESS).call();
  return balanceOf;
};

//klayswap에서는 미리 제가 값을 넣어두었었는데 venus의 경우는 유연하게 값을 넣을 수 있었습니다.
let tokenInMarket = {
  //예시 XVS: "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D",
};
let tokenInMarket_decimal = {
  //예시 XVS: "8",
};
let token_info = {
  //예시 XVS: {},
};
let tokenAddressForWallet = {
  SXP: '0x47bead2563dcbf3bf2c9407fea4dc236faba485a',
  XVS: '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63',
  USDC: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
  USDT: '0x55d398326f99059ff775485246999027b3197955',
  BUSD: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
  BTCB: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
  ETH: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
  LTC: '0x4338665cbb7b2485a8855a139b75d5e34ab0db94',
  XRP: '0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe',
  BCH: '0x8ff795a6f4d97e7887c79bea79aba5cc76444adf',
  DOT: '0x7083609fce4d1d8dc0c979aab8c869ea2c873402',
  LINK: '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd',
  DAI: '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
  FIL: '0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153',
  BETH: '0x250632378e573c6be1ac2f97fcdf00515d0aa91b',
  ADA: '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47',
  DOGE: '0xba2ae424d960c26247dd6c32edc70b295c744c43',
  CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
  UST: '0x23396cf899ca06c4472205fc903bdb4de249d6fc',
  MIR: '0x5b6dcf557e2abe2323c48445e8cc948910d8c2c9',
  TRX: '0x85eac5ac2f758618dfa09bdbe0cf174e7d574d5b',
  BTT: '0x8595f9da7b868b1822194faed312235e43007b49'
};
let tokenPriceInKRW = {
  SXP: '',
  XVS: '',
  USDC: '',
  USDT: '',
  BUSD: '',
  BTCB: '',
  ETH: '',
  LTC: '',
  XRP: '',
  BCH: '',
  DOT: '',
  LINK: '',
  DAI: '',
  FIL: '',
  BETH: '',
  ADA: '',
  DOGE: '',
  CAKE: '',
  UST: '',
  MIR: '',
  TRX: '',
  BTT: '',
  BNB: '',
  BTC: '',
  VAI: ''
};
async function updatePrice(){
  for(let k in tokenPriceInKRW){
    let url_bsc = `https://api.binance.com/api/v3/ticker/price?symbol=${k}BTC`
    let response = await fetch(url_bsc,options).then(res => res.json()).catch(err => console.error('error:' + err));
    tokenPriceInKRW[k] = response.price;    
  };
  for(let k in tokenPriceInKRW){
    if(tokenPriceInKRW[k] === undefined){
  
      let url_bsc = `https://api.binance.com/api/v3/ticker/price?symbol=BTC${k}`
      let response = await fetch(url_bsc,options).then(res => res.json()).catch(err => console.error('error:' + err));
      tokenPriceInKRW[k] = 1/response.price; 
      if(k == "BETH"){
        let url_bsc = `https://api.binance.com/api/v3/ticker/price?symbol=${k}ETH`
        let response = await fetch(url_bsc,options).then(res => res.json()).catch(err => console.error('error:' + err));
        tokenPriceInKRW[k] = response.price * tokenPriceInKRW.ETH; 
      };
      if(k == "BTC"){
        tokenPriceInKRW[k] = tokenPriceInKRW.BTCB;
      }
      if(k == "UST"){
        const TOKEN_BUSD = new web3.eth.Contract(ABI_BUSD, '0xe9e7cea3dedca5984780bafc599bd69add087d56');
        const TOKEN_UST = new web3.eth.Contract(ABI_UST,'0x23396cf899ca06c4472205fc903bdb4de249d6fc');
        const balanceBUSDInLP = await TOKEN_BUSD.methods.balanceOf(CONTRACT_BUSDUST_LP).call();
        const balanceUSTInLP = await TOKEN_UST.methods.balanceOf(CONTRACT_BUSDUST_LP).call();
  
        let ust = balanceBUSDInLP / balanceUSTInLP;// 1 ust in BUSD
        tokenPriceInKRW[k] = ust * tokenPriceInKRW.BUSD;
      }
    }
  }
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=BTC`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  let BTCprice = Math.floor(Number(result.last)*10)/10;
  for(let k in tokenPriceInKRW){
    tokenPriceInKRW[k] = tokenPriceInKRW[k] * BTCprice;
  };

  //console.log(tokenPriceInKRW);
};
//updatePrice();

async function BSCLending(USER_ADDRESS){

  await updatePrice(); 

  //tokenInMarket의 예시와 같이 토큰 이름과 주소가 짝맞춰서 저장됩니다.
  let all_asset_contract = await getAllMarkets();
  //console.log(all_asset_contract);
  for(let k in all_asset_contract){
    const _symbol = new web3.eth.Contract(ABI_DELEGATOR, all_asset_contract[k]);
    let symbol = await _symbol.methods.symbol().call();
    tokenInMarket[symbol.substring(1,5)] = all_asset_contract[k];

    //tokenInMarket_decimal의 예시와 같이 토큰이름과 decimal 값이 짝맞춰서 저장됩니다.
    const _decimals = new web3.eth.Contract(ABI_DELEGATOR, all_asset_contract[k]);
    let decimals = await _decimals.methods.decimals().call();
    tokenInMarket_decimal[symbol.substring(1,5)] = decimals;

    //바이낸스 api를 사용하여 token_info에 토큰정보를(가격..) 업데이트 합니다.
    let endpoint = `https://api.venus.io/api/vtoken?addresses=${all_asset_contract[k]}`
    let response = await fetch(endpoint,options_api).then(res => res.json()).catch(err => console.error('error:' + err));
    token_info[symbol.substring(1,5)] = response.data.markets[0];

  };
  //console.log(tokenInMarket);
  //console.log(tokenInMarket_decimal);
  //console.log(token_info.XVS.tokenPrice);

  let supplyBalanceSum_KRW = 0;
  let borrowBalanceSum_KRW = 0;
  

  let ret = {}; 

  ret.supply_token = {}; 
  //market에 있는 토큰들 중에 잔고가 있는 것을 뽑아냅니다. => 제가 supply 했다는 뜻입니다.
  for(let k in all_asset_contract){
    let allBalance = await balanceOf(USER_ADDRESS, all_asset_contract[k]);
    //console.log(allBalance);
    const _exchangeRateStored = new web3.eth.Contract(ABI_DELEGATOR, all_asset_contract[k]);
    let exchangeRateStored = await _exchangeRateStored.methods.exchangeRateStored().call();
    //console.log(exchangeRateStored)
    let existBalance = allBalance * exchangeRateStored / 1e36
    existBalance = Math.floor(existBalance * 1e8)/1e8;

    if(existBalance > 0){
      const _symbol = new web3.eth.Contract(ABI_DELEGATOR, all_asset_contract[k]);
      let symbol = await _symbol.methods.symbol().call();
      let tokenName = symbol.substring(1,5);
      // console.log(`Supplied ${tokenName}: ${existBalance} ( ${existBalance * tokenPriceInKRW[tokenName]} KRW )`);

      supplyBalanceSum_KRW = supplyBalanceSum_KRW + (existBalance * tokenPriceInKRW[tokenName]);

      //supply apy 계산
      let supplyAPY = Number(token_info[tokenName].supplyApy) + Number(token_info[tokenName].supplyVenusApy);
      supplyAPY = Math.floor(supplyAPY * 1e2) /1e2;
      // console.log(`Supply APY for ${tokenName}: ${supplyAPY} %`);

      ret.supply_token[tokenName] = {
        existBalance, 
        existBalance_KW: existBalance * tokenPriceInKRW[tokenName],
        supplyAPY, 
      }
    }
  };

  let supplyBalanceSum = 0; 
  let borrowBalanceSum = 0;

  //collateral enable한 supply market의 내 자산들의 (토큰)주소, borrow한 토큰의 토큰 주소
  //collateral enable한 자산에 대해서만 borrow가 가능합니다.
  let asset_contract = await getAssetsIn(USER_ADDRESS);
  //console.log(asset_contract);
  let collateralEnabledSum = 0;
  for(let k in asset_contract){//0보다 큰것만 출력해야합니다.
    
    let supplyBalance = await balanceOfUnderlying(asset_contract[k], USER_ADDRESS);
    if(supplyBalance > 0){
      const _symbol = new web3.eth.Contract(ABI_DELEGATOR, asset_contract[k]);
      let symbol = await _symbol.methods.symbol().call();
      let tokenName = symbol.substring(1,5);
      // console.log(`collateral enabled: ${tokenName}`);

      collateralEnabledSum = collateralEnabledSum + Number((supplyBalance / 1e18 * tokenPriceInKRW[tokenName]));

      //담보비율계산을 위해 미리 분모를 계산합니다.
      supplyBalance = supplyBalance / 1e18;
      supplyBalance = Math.floor(supplyBalance * 1e8) / 1e8;
      supplyBalanceSum = supplyBalanceSum + (supplyBalance *  token_info[tokenName].tokenPrice * token_info[tokenName].collateralFactor);
      
    };
  };
  ret.collateralEnabledSum = `${collateralEnabledSum} KRW`;

  ret.borrow = {}; 

  for(let k in asset_contract){//0보다 큰것만 출력해야합니다.
    
    let borrowBalance = await borrowBalanceCurrent(asset_contract[k], USER_ADDRESS);// => borrow한거 잔고
    borrowBalance = borrowBalance /1e18;
    borrowBalance = Math.floor(borrowBalance * 1e8) / 1e8;
    if(borrowBalance > 0){
      const _symbol = new web3.eth.Contract(ABI_DELEGATOR, asset_contract[k]);
      let symbol = await _symbol.methods.symbol().call();
      let tokenName = symbol.substring(1,5);
      // console.log(`Borrowed ${tokenName} ${borrowBalance} ( ${borrowBalance * tokenPriceInKRW[tokenName]} KRW )`);
      
      borrowBalanceSum_KRW = borrowBalanceSum_KRW + (borrowBalance * tokenPriceInKRW[tokenName]);

      //borrow apy 계산
      let borrowAPY = Number(token_info[tokenName].borrowVenusApy) - Number(token_info[tokenName].borrowApy) ;
      borrowAPY = Math.floor(borrowAPY * 1e2) /1e2;
      // console.log(`Borrow APY for ${tokenName}: ${borrowAPY} %`);
      ret.borrow[tokenName] = {
        borrowBalance, 
        borrowBalance_KW: borrowBalance * tokenPriceInKRW[tokenName], 
        borrowAPY
      };

      //담보비율계산을 위해 미리 분자를 계산합니다.
      borrowBalanceSum = borrowBalanceSum + (borrowBalance *  token_info[tokenName].tokenPrice);
    };
  };
  
  //담보비율을 계산합니다.
  let collateralRate = borrowBalanceSum / supplyBalanceSum * 100 * 1e18;
  collateralRate = Math.floor(collateralRate * 1e2) / 1e2;
  ret.collectable = `${collateralRate} %`;

  //현재 발행한 VAI의 총량입니다.
  const _mintedVAIs = new web3.eth.Contract(ABI_UNITROLLER, CONTRACT_UNITROLLER);
  let mintedBalance = await _mintedVAIs.methods.mintedVAIs(USER_ADDRESS).call();
  mintedBalance = mintedBalance / 1e18;
  mintedBalance = Math.floor(mintedBalance * 1e8) / 1e8;
  ret.mintedBalance = `${mintedBalance} ( ${mintedBalance * tokenPriceInKRW.VAI} KRW )`;

  //발행한 VAI 중에 staking 된 수량을 알려줍니다.
  const UserStaked = new web3.eth.Contract(ABI_CLAIM_STAKED_VAI, CONTRACT_VAIPROXY);
  let userInfo = await UserStaked.methods.userInfo(USER_ADDRESS).call();
  let staked = userInfo.amount;
  staked = staked / 1e18;
  staked = Math.floor(staked * 1e8) / 1e8;
  ret.staked = `${staked} ( ${staked * tokenPriceInKRW.VAI} KRW )`;//user staked amount

  //아래 두가지는 보상입니다.
  const _pendingXVS = new web3.eth.Contract(ABI_CLAIM_STAKED_VAI, CONTRACT_VAIPROXY);
  let pendingXVS = await _pendingXVS.methods.pendingXVS(USER_ADDRESS).call();
  pendingXVS = pendingXVS / 1e18;
  pendingXVS = Math.floor(pendingXVS * 1e8) / 1e8;
  ret.claimable = `${pendingXVS} ( ${pendingXVS * tokenPriceInKRW.XVS} KRW )`;//vault에 claim

  const _getXVSBalanceMeta = new web3.eth.Contract(ABI_VENUSLENS, CONTRACT_VENUSLENS);
  let getXVSBalanceMeta = await _getXVSBalanceMeta.methods.getXVSBalanceMetadataExt("0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63","0xfD36E2c2a6789Db23113685031d7F16329158384", USER_ADDRESS).call();
  let collectable = getXVSBalanceMeta.allocated;
  collectable = collectable / 1e18;
  collectable = Math.floor(collectable * 1e8) / 1e8;
  ret.collectable = `${collectable} ( ${collectable * tokenPriceInKRW.XVS} KRW )`;//vote에 collect

  // console.log("");
  //자산 총합을 출력해줍니다. in KRW
  ret.totalAsset = `${supplyBalanceSum_KRW + borrowBalanceSum_KRW + (mintedBalance * tokenPriceInKRW.VAI)} KRW`;
  ret.pureAsset = `${supplyBalanceSum_KRW} KRW`;
  ret.debt = `${borrowBalanceSum_KRW + (mintedBalance * tokenPriceInKRW.VAI)} KRW`;


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////총 수익률 계산..
  let totalapy = 0;
  for(let k in all_asset_contract){
    let allBalance = await balanceOf(USER_ADDRESS, all_asset_contract[k]);
    //console.log(allBalance);
    const _exchangeRateStored = new web3.eth.Contract(ABI_DELEGATOR, all_asset_contract[k]);
    let exchangeRateStored = await _exchangeRateStored.methods.exchangeRateStored().call();
    //console.log(exchangeRateStored)
    let existBalance = allBalance * exchangeRateStored / 1e36
    existBalance = Math.floor(existBalance * 1e8)/1e8;

    if(existBalance > 0){
      const _symbol = new web3.eth.Contract(ABI_DELEGATOR, all_asset_contract[k]);
      let symbol = await _symbol.methods.symbol().call();
      let tokenName = symbol.substring(1,5);
      //console.log(`Supplied ${tokenName}: ${existBalance} ( ${existBalance * tokenPriceInKRW[tokenName]} KRW )`);
      let weightedRate = (existBalance * tokenPriceInKRW[tokenName]) / supplyBalanceSum_KRW;
      //supply apy 계산
      let supplyAPY = Number(token_info[tokenName].supplyApy) + Number(token_info[tokenName].supplyVenusApy);
      supplyAPY = Math.floor(supplyAPY * 1e2) /1e2;
      //console.log(`Supply APY for ${tokenName}: ${supplyAPY} %`);
      totalapy = totalapy + (weightedRate * supplyAPY);
    }
  };
  
  ret.totalAPY = `${totalapy} %`

  return ret; 
};
//Lending();

// async function exc(){
//   await updatePrice();
//   await Lending();
// };
// exc(); 

module.exports = { BSCLending }; 