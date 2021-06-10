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


async function balanceOf(USER_ADDRESS, TOKEN_ADDRESS){
  const _balanceOf = new web3.eth.Contract(ABI_DELEGATOR, TOKEN_ADDRESS);
  let balanceOf = await _balanceOf.methods.balanceOf(USER_ADDRESS).call();
  return balanceOf;
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
function toFixFloat(num, n=6) { 
    return Number(num.toFixed(n))
}

async function BSCBalanceWallet(USER_ADDRESS){

  await updatePrice(); 

  try{ 
	let ret = {};

	web3.eth.getBalance(USER_ADDRESS).then((balance) => {
		balance /= 10**18;
		ret.BNB_balance = toFixFloat(balance); 
		ret.BNB_balance_KW = toFixFloat(balance * tokenPriceInKRW.BNB); 
		// console.log(`BNB: ${balance} ( ${balance * tokenPriceInKRW.BNB} KRW )`);
	});

	ret.tokens = {}; 
	for(let k in tokenAddressForWallet){
		let _balance = await balanceOf(USER_ADDRESS, tokenAddressForWallet[k]);
		const _decimals = new web3.eth.Contract(ABI_DELEGATOR, tokenAddressForWallet[k]);
		let decimals = await _decimals.methods.decimals().call();
		//console.log(decimals);
		if(_balance > 0){
		for(let i = 0 ; i < decimals ; i++){
			_balance = _balance / 10;
		};
		if(_balance * tokenPriceInKRW[k] >1){
			ret.tokens[k] = {
				token_balance: toFixFloat(_balance), 
				token_balance_KW: toFixFloat(_balance * tokenPriceInKRW[k])
			}
			// console.log(`${k}: ${_balance} ( ${_balance * tokenPriceInKRW[k]} KRW )`);
		}
		};
	};

	return ret; 
	} catch(err) { 
		console.error(err); 
	}
};
//BalanceInWallet();
// async function exc(){
//   await updatePrice();
//   await BalanceInWallet();
// };
// exc(); 


module.exports = { BSCBalanceWallet }; 