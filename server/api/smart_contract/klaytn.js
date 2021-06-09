
//Klaytn API Service를 사용하기 위해 SDK를 설치합니다.

//아래와 같은 패키지를 사전에 설치해주세요
//Node.js
//npm
//gcc-c++

//npm install caver-js-ext-kas 명령어로 sdk를 설치합니다.
//https://docs.klaytnapi.com/sdk 참고

const CaverExtKAS = require('caver-js-ext-kas');
const caver = new CaverExtKAS();
//메인넷은 8217, 테스트넷은 1001
//KAS console을 사용하기위한 access key 입니다. => 트랜잭션 보내는게 무료(하루에 10000번까지)
caver.initKASAPI(8217, "KASKBDIFAXVXK14IEVRJDFVS","xW5VfL4rS6lOuEENPBs5jt0UeVDYMxgRIA14EAoS");


//decode 함수 사용하기 위해 web3js import
//npm install web3 명령어로 설치합니다.
//현재로서는 단순히 encode, decode 함수 사용을 위해 가져옵니다.
//https://web3js.readthedocs.io/en/v1.3.0/getting-started.html
const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new Web3.providers.HttpProvider('http://localhost:8551'));

//거래소에서 코인과 토큰 가격을 불러오기 위해 사용합니다.
const fetch = require('node-fetch');
const options = {method: 'GET', headers: {Accept: 'application/json'}};


const USER_ADDRESS = "0xe30d11D8f97755ef528e5Ff7a25296c528eE607A";

const TOKEN_DECIMAL = {
  KLAY : "18",
  KSP : "18",
  KWBTC : "8",
  KORC : "18",
  KUSDT : "6",//!
  KETH : "18",
  KXRP : "6",
  KAUTO : "18",//!!
  KTRIX : "18",
  KBELT : "18",//!
  KBNB : "18",
  KXVS : "18",//
  KDAI : "18",//!
  CLBK : "18",//!
  AGOV : "18",//!
  HINT : "18",//!
  ABL : "18",
  HIBS : "18",
  KHANDY : "18",
  BBC : "18",//!
  REDi : "18",
  MNR : "6",
  KDUCATO : "18",
  SSX : "18",
  TEMCO : "18",
  BEE : "18",//!!!!!
  WEMIX : "18",
  TRCL : "18",
  WIKEN : "18",
  SKLAY : "18",
  ISR : "18",
  PIB : "18",
  KSLO : "8",//!!!!!
  KSVE : "8"//!!!!!
};
const TOKEN_ADDRESS = {
  KLAY : "",
  KSP : "0xc6a2ad8cc6e4a7e08fc37cc5954be07d499e7654",
  KWBTC : "0x16d0e1fbd024c600ca0380a4c5d57ee7a2ecbf9c",
  KORC : "0xfe41102f325deaa9f303fdd9484eb5911a7ba557",
  KUSDT : "0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167",
  KETH : "0x34d21b1e550d73cee41151c77f3c73359527a396",
  KXRP : "0x9eaefb09fe4aabfbe6b1ca316a3c36afc83a393f",
  KAUTO : "0x8583063110b5d29036eced4db1cc147e78a86a77",
  KTRIX : "0x0c1d7ce4982fd63b1bc77044be1da05c995e4463",
  KBELT : "0xdfe180e288158231ffa5faf183eca3301344a51f",
  KBNB : "0x574e9c26bda8b95d7329505b4657103710eb32ea",
  KXVS : "0x735106530578fb0227422de25bb32c9adfb5ea2e",
  KDAI : "0x5c74070fdea071359b86082bd9f9b3deaafbe32b",
  CLBK : "0xc4407f7dc4b37275c9ce0f839652b393e13ff3d1",
  AGOV : "0x588c62ed9aa7367d7cd9c2a9aaac77e44fe8221b",
  HINT : "0x4dd402a7d54eaa8147cb6ff252afe5be742bdf40",
  ABL : "0x46f307b58bf05ff089ba23799fae0e518557f87c",
  HIBS : "0xe06b40df899b9717b4e6b50711e1dc72d08184cf",
  KHANDY : "0x3f34671fba493ab39fbf4ecac2943ee62b654a88",
  BBC : "0x321bc0b63efb1e4af08ec6d20c85d5e94ddaaa18",
  REDi : "0x1cd3828a2b62648dbe98d6f5748a6b1df08ac7bb",
  MNR : "0x27dcd181459bcddc63c37bab1e404a313c0dfd79",
  KDUCATO : "0x91e0d7b228a33072d9b3209cf507f78a4bd835f2",
  SSX : "0xdcd62c57182e780e23d2313c4782709da85b9d6c",
  TEMCO : "0x3b3b30a76d169f72a0a38ae01b0d6e0fbee3cc2e",
  BEE : "0x75ad14d0360408dc6f8163e5dfb51aad516f4afd",
  WEMIX : "0x5096db80b21ef45230c9e423c373f1fc9c0198dd",
  TRCL : "0x4b91c67a89d4c4b2a4ed9fcde6130d7495330972",
  WIKEN : "0x275f942985503d8ce9558f8377cc526a3aba3566",
  SKLAY : "0xa323d7386b671e8799dca3582d6658fdcdcd940a",
  ISR : "0x9657fb399847d85a9c1a234ece9ca09d5c00f466",
  PIB : "0xafde910130c335fa5bd5fe991053e3e0a49dce7b",
  KSLO : "0xf7689072554d1e85fa9d96151f528764277d7db2",
  KSVE : "0x065a9ddbbdd48c4189984e2f7aeda3834bd1eac7"
};

let token_price = {//updateall 함수를 통해 아래 토큰들한테 값을 입혀줍니다.
  KLAY : "",
  KSP : "",
  KWBTC : "",
  KORC : "",
  KUSDT : "",//!
  KETH : "",
  KXRP : "",
  KAUTO : "",//보류
  KTRIX : "",
  KBELT : "",//!
  KBNB : "",
  KXVS : "",//no need
  KDAI : "",//!
  CLBK : "",
  AGOV : "",//!
  HINT : "",
  ABL : "",
  HIBS : "",
  KHANDY : "",
  BBC : "",//!
  REDi : "",
  MNR : "",
  KDUCATO : "",
  SSX : "",
  TEMCO : "",
  BEE : "",//no need
  WEMIX : "",
  TRCL : "",
  WIKEN : "",
  SKLAY : "",
  ISR : "",
  PIB : "",
  KSLO : "",//no need
  KSVE : ""//no need
};
//callContract 함수 사용할 때, 요구하는 경우가 있습니다.
const callArguments = [
  {
    type: 'address',
    value: USER_ADDRESS,
  },
];
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//일단 총 3가지 방법으로 가격을 업데이트합니다.
//함수 하나당 하나의 토큰 가격을 업데이트 합니다.
//코인원, 빗썸, 클레이스왑인데 코인원과 빗썸은 거의 동일한 코드 입니다.
//클레이스왑으로 가격을 업데이트하는 경우는 해당토큰을 KLAY로 환산하는 방식이라 KLAY가격은 항상 먼저 업데이트 되어야합니다.
//좀 더 구체적으로 클레이스왑을 통해 업데이트하는 방식이 궁금하시다면 ted에게 문의 주세요..
//거래소 가격으로 token_price 객체 update
async function updatePrice_KLAY(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'KLAY'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.KLAY = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_KSP(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'KSP'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.KSP = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_KWBTC(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'BTC'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.KWBTC = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_KORC(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'ORC'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.KORC = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_KUSDT(){
  //tokenA와 tokenB의 balance가 연달아 담겨져 온다. => substring으로 분리
  const TotalBalanceOfPool = await caver.kas.wallet.callContract("0xd83f1b074d81869eff2c46c530d7308ffec18036", 'getCurrentPool');
  let tokenA = (TotalBalanceOfPool.result).substring(0, 66);
  let tokenB = (TotalBalanceOfPool.result).substring(66, 132);
  let tokenA_decimal = web3.eth.abi.decodeParameter("uint256", tokenA);
  let tokenB_decimal = web3.eth.abi.decodeParameter("uint256", "0x"+tokenB);

  let tokenA_name = "KLAY";
  let tokenB_name = "KUSDT";
  
  for(let i = 0 ; i < TOKEN_DECIMAL[tokenA_name]; i++){
    tokenA_decimal = tokenA_decimal / 10;
  };
  for(let i = 0 ; i < TOKEN_DECIMAL[tokenB_name]; i++){
    tokenB_decimal = tokenB_decimal / 10;
  };

  //total supply of KSLP
  const TotalSupplyKSLP = await caver.kas.wallet.callContract("0xd83f1b074d81869eff2c46c530d7308ffec18036", 'totalSupply');
  let TotalSupplyKSLP_hex = (TotalSupplyKSLP.result).substring(0,66);
  let TotalSupplyKSLP_decimal= web3.eth.abi.decodeParameter("uint256", TotalSupplyKSLP_hex);
  TotalSupplyKSLP_decimal = TotalSupplyKSLP_decimal / 1e18;

  let singleLPtokenA = tokenA_decimal / TotalSupplyKSLP_decimal;
  let singleLPtokenB = tokenB_decimal / TotalSupplyKSLP_decimal;

  token_price.KUSDT = singleLPtokenA / singleLPtokenB * token_price.KLAY;
};
async function updatePrice_KETH(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'ETH'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.KETH = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_KXRP(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'XRP'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.KXRP = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_KAUTO(){
  
};
async function updatePrice_KTRIX(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'TRIX'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.KTRIX = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_KBELT(){
  //tokenA와 tokenB의 balance가 연달아 담겨져 온다. => substring으로 분리
  const TotalBalanceOfPool = await caver.kas.wallet.callContract("0x157c39202fae6233fec3f8b3bcb2158200d0a863", 'getCurrentPool');
  let tokenA = (TotalBalanceOfPool.result).substring(0, 66);
  let tokenB = (TotalBalanceOfPool.result).substring(66, 132);
  let tokenA_decimal = web3.eth.abi.decodeParameter("uint256", tokenA);
  let tokenB_decimal = web3.eth.abi.decodeParameter("uint256", "0x"+tokenB);

  let tokenA_name = "KLAY";
  let tokenB_name = "KBELT";
  
  for(let i = 0 ; i < TOKEN_DECIMAL[tokenA_name]; i++){
    tokenA_decimal = tokenA_decimal / 10;
  };
  for(let i = 0 ; i < TOKEN_DECIMAL[tokenB_name]; i++){
    tokenB_decimal = tokenB_decimal / 10;
  };

  //total supply of KSLP
  const TotalSupplyKSLP = await caver.kas.wallet.callContract("0x157c39202fae6233fec3f8b3bcb2158200d0a863", 'totalSupply');
  let TotalSupplyKSLP_hex = (TotalSupplyKSLP.result).substring(0,66);
  let TotalSupplyKSLP_decimal= web3.eth.abi.decodeParameter("uint256", TotalSupplyKSLP_hex);
  TotalSupplyKSLP_decimal = TotalSupplyKSLP_decimal / 1e18;

  let singleLPtokenA = tokenA_decimal / TotalSupplyKSLP_decimal;
  let singleLPtokenB = tokenB_decimal / TotalSupplyKSLP_decimal;

  token_price.KBELT = singleLPtokenA / singleLPtokenB * token_price.KLAY;
};
async function updatePrice_KBNB(){
  let url_bithumb = `https://api.bithumb.com/public/ticker/${'BNB'}_KRW`
  let response = await fetch(url_bithumb,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.KBNB = Math.floor(Number(response.data.closing_price)*10)/10;
};
async function updatePrice_KXVS(){
  
};
async function updatePrice_KDAI(){
  //tokenA와 tokenB의 balance가 연달아 담겨져 온다. => substring으로 분리
  const TotalBalanceOfPool = await caver.kas.wallet.callContract("0xa3987cf6C14F1992e8b4a9E23192Eb79dC2969b8", 'getCurrentPool');
  let tokenA = (TotalBalanceOfPool.result).substring(0, 66);
  let tokenB = (TotalBalanceOfPool.result).substring(66, 132);
  let tokenA_decimal = web3.eth.abi.decodeParameter("uint256", tokenA);
  let tokenB_decimal = web3.eth.abi.decodeParameter("uint256", "0x"+tokenB);

  let tokenA_name = "KLAY";
  let tokenB_name = "KDAI";
  
  for(let i = 0 ; i < TOKEN_DECIMAL[tokenA_name]; i++){
    tokenA_decimal = tokenA_decimal / 10;
  };
  for(let i = 0 ; i < TOKEN_DECIMAL[tokenB_name]; i++){
    tokenB_decimal = tokenB_decimal / 10;
  };

  //total supply of KSLP
  const TotalSupplyKSLP = await caver.kas.wallet.callContract("0xa3987cf6C14F1992e8b4a9E23192Eb79dC2969b8", 'totalSupply');
  let TotalSupplyKSLP_hex = (TotalSupplyKSLP.result).substring(0,66);
  let TotalSupplyKSLP_decimal= web3.eth.abi.decodeParameter("uint256", TotalSupplyKSLP_hex);
  TotalSupplyKSLP_decimal = TotalSupplyKSLP_decimal / 1e18;

  let singleLPtokenA = tokenA_decimal / TotalSupplyKSLP_decimal;
  let singleLPtokenB = tokenB_decimal / TotalSupplyKSLP_decimal;

  token_price.KDAI = singleLPtokenA / singleLPtokenB * token_price.KLAY;
};
async function updatePrice_CLBK(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'CLB'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.CLBK = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_AGOV(){
  //tokenA와 tokenB의 balance가 연달아 담겨져 온다. => substring으로 분리
  const TotalBalanceOfPool = await caver.kas.wallet.callContract("0x5c6795e72c47d7fa2b0c7a6446d671aa2e381d1e", 'getCurrentPool');
  let tokenA = (TotalBalanceOfPool.result).substring(0, 66);
  let tokenB = (TotalBalanceOfPool.result).substring(66, 132);
  let tokenA_decimal = web3.eth.abi.decodeParameter("uint256", tokenA);
  let tokenB_decimal = web3.eth.abi.decodeParameter("uint256", "0x"+tokenB);

  let tokenA_name = "KLAY";
  let tokenB_name = "AGOV";
  
  for(let i = 0 ; i < TOKEN_DECIMAL[tokenA_name]; i++){
    tokenA_decimal = tokenA_decimal / 10;
  };
  for(let i = 0 ; i < TOKEN_DECIMAL[tokenB_name]; i++){
    tokenB_decimal = tokenB_decimal / 10;
  };

  //total supply of KSLP
  const TotalSupplyKSLP = await caver.kas.wallet.callContract("0x5c6795e72c47d7fa2b0c7a6446d671aa2e381d1e", 'totalSupply');
  let TotalSupplyKSLP_hex = (TotalSupplyKSLP.result).substring(0,66);
  let TotalSupplyKSLP_decimal= web3.eth.abi.decodeParameter("uint256", TotalSupplyKSLP_hex);
  TotalSupplyKSLP_decimal = TotalSupplyKSLP_decimal / 1e18;

  let singleLPtokenA = tokenA_decimal / TotalSupplyKSLP_decimal;
  let singleLPtokenB = tokenB_decimal / TotalSupplyKSLP_decimal;

  token_price.AGOV = singleLPtokenA / singleLPtokenB * token_price.KLAY;
};
async function updatePrice_HINT(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'HINT'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.HINT = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_ABL(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'ABL'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.ABL = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_HIBS(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'HIBS'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.HIBS = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_KHANDY(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'HANDY'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.KHANDY = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_BBC(){
  //tokenA와 tokenB의 balance가 연달아 담겨져 온다. => substring으로 분리
  const TotalBalanceOfPool = await caver.kas.wallet.callContract("0x9d9de38c473d769d76034200f122995d8b6550ea", 'getCurrentPool');
  let tokenA = (TotalBalanceOfPool.result).substring(0, 66);
  let tokenB = (TotalBalanceOfPool.result).substring(66, 132);
  let tokenA_decimal = web3.eth.abi.decodeParameter("uint256", tokenA);
  let tokenB_decimal = web3.eth.abi.decodeParameter("uint256", "0x"+tokenB);

  let tokenA_name = "KLAY";
  let tokenB_name = "BBC";
  
  for(let i = 0 ; i < TOKEN_DECIMAL[tokenA_name]; i++){
    tokenA_decimal = tokenA_decimal / 10;
  };
  for(let i = 0 ; i < TOKEN_DECIMAL[tokenB_name]; i++){
    tokenB_decimal = tokenB_decimal / 10;
  };

  //total supply of KSLP
  const TotalSupplyKSLP = await caver.kas.wallet.callContract("0x9d9de38c473d769d76034200f122995d8b6550ea", 'totalSupply');
  let TotalSupplyKSLP_hex = (TotalSupplyKSLP.result).substring(0,66);
  let TotalSupplyKSLP_decimal= web3.eth.abi.decodeParameter("uint256", TotalSupplyKSLP_hex);
  TotalSupplyKSLP_decimal = TotalSupplyKSLP_decimal / 1e18;

  let singleLPtokenA = tokenA_decimal / TotalSupplyKSLP_decimal;
  let singleLPtokenB = tokenB_decimal / TotalSupplyKSLP_decimal;

  token_price.BBC = singleLPtokenA / singleLPtokenB * token_price.KLAY;
};
async function updatePrice_REDi(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'REDI'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.REDi = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_MNR(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'MNR'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.MNR = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_KDUCATO(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'DUCATO'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.KDUCATO = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_SSX(){
  let url_bithumb = `https://api.bithumb.com/public/ticker/${'SSX'}_KRW`
  let response = await fetch(url_bithumb,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.SSX = Math.floor(Number(response.data.closing_price)*10)/10;
};
async function updatePrice_TEMCO(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'TEMCO'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.TEMCO = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_WEMIX(){
  let url_bithumb = `https://api.bithumb.com/public/ticker/${'WEMIX'}_KRW`
  let response = await fetch(url_bithumb,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.WEMIX = Math.floor(Number(response.data.closing_price)*10)/10;
};
async function updatePrice_TRCL(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'TRCL'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.TRCL = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_WIKEN(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'WIKEN'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.WIEKN = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_ISR(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'ISR'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.ISR = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_PIB(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'PIB'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.PIB = Math.floor(Number(result.last)*10)/10;
};
async function updatePrice_SKLAY(){
  let url_coinone = `https://api.coinone.co.kr/ticker?currency=${'SKLAY'}`;
  let result = await fetch(url_coinone,options).then(res => res.json()).catch(err => console.error('error:' + err));
  token_price.SKLAY = Math.floor(Number(result.last)*10)/10;
};
async function updateAll(){
  await updatePrice_KLAY();
  await updatePrice_KSP();
  await updatePrice_KWBTC();
  await updatePrice_KORC();
  await updatePrice_KUSDT();
  await updatePrice_KETH();
  await updatePrice_KXRP();
  await updatePrice_KAUTO();
  await updatePrice_KTRIX();
  await updatePrice_KBELT();
  await updatePrice_KBNB();
  await updatePrice_KXVS();
  await updatePrice_KDAI();
  await updatePrice_CLBK();
  await updatePrice_AGOV();
  await updatePrice_HINT();
  await updatePrice_ABL();
  await updatePrice_HIBS();
  await updatePrice_KHANDY();
  await updatePrice_BBC();
  await updatePrice_REDi();
  await updatePrice_MNR();
  await updatePrice_KDUCATO();
  await updatePrice_SSX();
  await updatePrice_TEMCO();
  await updatePrice_WEMIX();
  await updatePrice_TRCL();
  await updatePrice_WIKEN();
  await updatePrice_ISR();
  await updatePrice_PIB();
  await updatePrice_SKLAY();

};

//updateAll();
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /*
    대략적인 패턴이 존재합니다.
    일단 callContract함수를 사용합니다. 주로 해당 스마트컨트랙트 주소와 스마트컨트랙트 내부에 구현된 함수 이름을 전달하여 사용합니다.
    반환값이 객체여서, result값만 추출합니다.
    추출한 result값은 문자열이고 web3 모듈로 decoding 해줍니다.
    적절히 소수점을 조절해서 출력합니다.
  */ 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////    
//klay를 포함한 지갑에 있는 모든 토큰의 잔고를 조회합니다. 
function toFixFloat(num, n=6) { 
    return Number(num.toFixed(n))
}
async function KlaytnBalanceWallet(USER_ADDRESS){
    await updateAll();
    
    try{
        //klay 잔고 출력
        let ret = {}; 

        let KLAYBalance = await caver.rpc.klay.getBalance(USER_ADDRESS);
        KLAYBalance = Math.floor(KLAYBalance/1e12) * 1e12 / 1e18;

        ret.Klaytn_balance = toFixFloat(KLAYBalance); 
        ret.Klaytn_balance_KW = toFixFloat(token_price.KLAY * KLAYBalance);

        // console.log(`KLAY_balance:  ${KLAYBalance} ( ${KLAYBalance * token_price.KLAY} KRW )`);//원화 환산 출력이 추가되었습니다.

        //token들 잔고 출력
        ret.tokens = {}; 

        for(let i in TOKEN_ADDRESS){
            if(i != "KLAY"){
                const tokenBalance = await caver.kas.wallet.callContract(TOKEN_ADDRESS[i], 'balanceOf',callArguments);
                let tokenBalance_hex = (tokenBalance.result).substring(0,66);
                let tokenBalance_decimal = web3.eth.abi.decodeParameter("uint256", tokenBalance_hex);
                let tokenDecimal = TOKEN_DECIMAL[i];
                for(let i = 0 ; i < tokenDecimal; i++){
                    tokenBalance_decimal = tokenBalance_decimal / 10;
                };
                if (tokenBalance_decimal > 1e-6){

                    ret.tokens[i] = {
                        token_balance: toFixFloat(tokenBalance_decimal), 
                        token_balance_KW: toFixFloat(tokenBalance_decimal * token_price[i]), 
                    }
                    // console.log(`${i}: ${tokenBalance_decimal} ( ${tokenBalance_decimal * token_price[i]} KRW )`);//정말 작은 잔고는 무시합니다, 원화 환산 출력이 추가되었습니다.
                }
            }
        };  
        return ret; 

    }catch(err){
        console.error(err);
  }
};
//BalanceInWallet();
// async function printall(){
//   await updateAll();
//   await BalanceInWallet();
// };
// printall();

module.exports = { KlaytnBalanceWallet }; 
