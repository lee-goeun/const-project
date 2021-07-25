const CaverExtKAS = require('caver-js-ext-kas');
const caver = new CaverExtKAS();

const access_key_array = ["KASKQO63SLJW75Q0FJB61B4N", "KASKBDIFAXVXK14IEVRJDFVS"]; //  
const ACCESS_KEY = access_key_array[0]; 

const private_key_array = ["QAXbYjYlXCf5BAgax7Dm-C0j-kk8RRcW0yfJYNcH", "xW5VfL4rS6lOuEENPBs5jt0UeVDYMxgRIA14EAoS"]; 
const PRIVATE_KEY = private_key_array[0]; 

caver.initKASAPI(8217, ACCESS_KEY, PRIVATE_KEY);

const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider()); 

const { Token } = require('../../models/Token');

const fetch = require('node-fetch');

async function getKLAYCurrency() { 
  let url_bithumb = `https://api.bithumb.com/public/ticker/KLAY_KRW`
  let klay_price_krw = await fetch(url_bithumb,{method: 'GET', headers: {Accept: 'application/json'}})
                        .then(res => res.json())
                        .then(res => res.data.closing_price)
                        .catch(err => console.error('error:' + err));
  return klay_price_krw; 
}

async function getCurrentPool(address) { 
  let current_pool = await caver.kas.wallet.callContract(address, 'getCurrentPool')
                                           .then(res => res.result)
                                           .catch(err => console.log(err)); 
  let tokenA_decimal = web3.eth.abi.decodeParameter("uint256", current_pool.substring(0, 66));
  let tokenB_decimal = web3.eth.abi.decodeParameter("uint256", "0x"+current_pool.substring(66, 132));
  return tokenA_decimal/tokenB_decimal; 
}

async function calcTokenPriceB(address, tokenA_price, diff_decimal, to_fixed=2) { 
  let tokenAB_ratio = await getCurrentPool(address);
  let tokenB_price = tokenA_price * tokenAB_ratio; 
  tokenB_price *= Math.pow(10, diff_decimal); 
  return Number(tokenB_price.toFixed(to_fixed)); 
}

async function getKlaytnTokenPrice(){

  let tokens = await Token.find({network: 'Klaytn'})
  let tokens_obj = tokens.reduce((obj, t) => Object.assign(obj, { [t.token]: t}), {}); 
  let price_obj = {}; 

  let klay_price = await getKLAYCurrency(); 
  klay_price = Number(klay_price); 
  price_obj.KLAY = klay_price;

  for (let token of tokens) { // KLAY-?? LP
    const { atype, address, token:token_name } = token; 
    if (atype === 'SINGLE' || !token_name.includes('KLAY')) continue; 

    let [ tokenA, tokenB ] = token_name.split('_'); 
    if (!tokens_obj.hasOwnProperty(tokenB)) continue; 
    let diff_decimal = tokens_obj[tokenB].decimal - tokens_obj[tokenA].decimal; 
    let tokenB_price = await calcTokenPriceB(address, klay_price, diff_decimal); 
    price_obj[tokenB] = tokenB_price; 
  }

  for (let token of tokens) { // ??-?? LP
    const { atype, address, token:token_name } = token; 
    if (atype === 'SINGLE' || token_name.includes('KLAY')) continue; 
    let [ tokenA, tokenB ] = token_name.split('_'); 
    if (price_obj.hasOwnProperty(tokenA) && price_obj.hasOwnProperty(tokenB)) continue; 
    if (!price_obj.hasOwnProperty(tokenA) && !price_obj.hasOwnProperty(tokenB)) continue;
    
    let target_token = price_obj.hasOwnProperty(tokenA) ? tokenB : tokenA; 
    let cmp_token = target_token === tokenA ? tokenB : tokenA; 

    let diff_decimal = tokens_obj[target_token].decimal - tokens_obj[cmp_token].decimal; 
    let target_token_price = await calcTokenPriceB(address, price_obj[cmp_token], diff_decimal); 
    price_obj[target_token] = target_token_price;
  }
  return price_obj;
};

async function getKlaytnBalanceWallet(USER_ADDRESS, to_krw=true){
  let wallet_balance = {};

  const USER_DATA = [ { type: 'address', value: USER_ADDRESS } ];
  let amount_KLAY = await caver.rpc.klay.getBalance(USER_DATA[0].value);
  amount_KLAY = Math.floor(amount_KLAY/1e12) / 1e6;

  let tokens = await Token.find({atype: 'SINGLE', network: 'Klaytn'}) 
                          .then(tokens => tokens.reduce((obj, t) => Object.assign(obj, { [t.token]: t}), {}))

  wallet_balance.KLAY = to_krw ? amount_KLAY * tokens.KLAY.price : amount_KLAY; 

  for(let token_name in tokens){
    if (token_name === 'KLAY') continue; 
    const token = tokens[token_name]; 

    const balanceOf = await caver.kas.wallet.callContract(token.address, 'balanceOf',USER_DATA)
                                            .then(res => res.result);
    let tokenBalance_decimal = web3.eth.abi.decodeParameter("uint256", balanceOf.substring(0,66));
    let token_amount = tokenBalance_decimal / Math.pow(10, Number(token.decimal));
    
    if(token_amount < 1e-6) continue;
    wallet_balance[token_name] = to_krw ? token_amount * token.price : token_amount;
  };
  return wallet_balance;
};

module.exports = { getKlaytnTokenPrice, getKlaytnBalanceWallet }; 
