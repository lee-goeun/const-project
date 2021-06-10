import React from 'react'; 
import { withRouter } from 'react-router';


function LendingInfo(props) {

  const {lending} = props;
  console.log("lending: ", lending, typeof(lending))

  // const lending = {
  //   "supply_token":{
  //     "XVS":{"existBalance":1.07317099,"existBalance_KW":32716.91831338988,"supplyAPY":6.84},
  //     "BNB":{"existBalance":0.03000876,"existBalance_KW":12418.993587543599,"supplyAPY":4.62},
  //     "DOT":{"existBalance":1.28485106,"existBalance_KW":34876.835024016225,"supplyAPY":2.27}
  //   },
  //   "collateralEnabledSum":"80012.75697460875 KRW",
  //   "borrow":{
  //     "BTC":{"borrowBalance":0.00020007,"borrowBalance_KW":8581.0023,"borrowAPY":0.47}
  //   },
  //   "collectable":"0.00092605 ( 28.231756622600003 KRW )",
  //   "mintedBalance":"3.00015707 ( 3135.7036926674136 KRW )",
  //   "staked":"0 ( 0 KRW )",
  //   "claimable":"0 ( 0 KRW )",
  //   "totalAsset":"91729.45291761713 KRW",
  //   "pureAsset":"80012.74692494971 KRW",
  //   "debt":"11716.705992667414 KRW",
  //   "totalAPY":"4.503406032048081 %"
  // }


  let supply_token = []; 
  let supply_token_jsx;

  if (lending.supply_token){ 
    for (const [key, value] of Object.entries(lending.supply_token)) {
      supply_token.push({key, value})
    }
    supply_token_jsx = (
      supply_token.map(elem => { 
        return (
          <>
            <div style={{
              border: '1px solid #F2F2F2',  
              borderRadius: '5px', 
              marginBottom: '20px',
              padding: '5px'
            }}>
              <div style={{fontSize: '14px', fontWeight: 'bold', color: '#6B69F7'}}>token: {elem.key}</div>
              <div>existBalance: {elem.value.existBalance} ( {elem.value.existBalance_KW} 원 )</div>
              <div>supplyAPY: {elem.value.supplyAPY} % </div>
            </div>
          </>
        )
      })
    )
  }

  let borrow_token = []; 
  let borrow_token_jsx; 
  if (lending.borrow){ 
    for (const [key, value] of Object.entries(lending.borrow)) {
      borrow_token.push({key, value})
    }
    borrow_token_jsx = (
      borrow_token.map(elem => { 
        return (
          <>
            <div style={{
              border: '1px solid #F2F2F2',  
              borderRadius: '5px', 
              marginBottom: '20px',
              padding: '5px'
            }}>
              <div style={{fontSize: '14px', fontWeight: 'bold', color: '#6B69F7'}}>token: {elem.key}</div>
              <div>borrowBalance: {elem.value.borrowBalance} ( {elem.value.borrowBalance_KW} 원 )</div>
              <div>borrowAPY: {elem.value.borrowAPY} % </div>
            </div>
          </>
        )
      })
    )
  }

  let rest;
  if (lending.collectable) { 
    rest = (
      <div style={{fontSize: '10px'}}>
        <div>collateralEnabledSum: {lending.collateralEnabledSum}</div>
        <div>collectable: {lending.collectable}</div>
        <div>mintedBalance: {lending.mintedBalance}</div>
        <div>staked: {lending.staked}</div>
        <div>claimable: {lending.claimable}</div>
        <div>totalAsset: {lending.totalAsset}</div>
        <div>pureAsset: {lending.pureAsset}</div>
        <div>debt: {lending.debt}</div>
        <div>totalAPY: {lending.totalAPY}</div>
      </div>
    )
  }


  // const borrow_token = [];

  // const borrow_token = (
    
  // )





  // React.useEffect(() => { 
  //   const {KlayWallet} = props;
  //   if (KlayWallet.atype) {
  //     const {address, atype} = KlayWallet; 
      
  //     axios.post('/api/wallet/balance', {address, atype})
  //       .then( (res) => { 
  //         setBalance(res.data.result);
  //         console.log(res.data);
  //       })
  //   }
  // }, [])

  return ( 
      <>
        <div style={{fontSize: '10px'}}>
          <span style={{fontSize: '14px', fontWeight: 'bold'}}>Supply Tokens</span>
          {supply_token && 
            supply_token_jsx}
          {/* {lending.supply_token && JSON.stringify(lending)} */}
        </div>

        <div style={{fontSize: '10px'}}>
          <span style={{fontSize: '14px', fontWeight: 'bold'}}>Borrow Tokens</span>
          {borrow_token && 
            borrow_token_jsx}
          {/* {lending.supply_token && JSON.stringify(lending)} */}
        </div>

        {rest}


      </>
  )
}

export default withRouter(LendingInfo)