import React, {useState} from 'react'; 

import axios from 'axios'; 

import { useHistory } from 'react-router-dom'; 
import { useDispatch } from 'react-redux'; 
import { withRouter } from 'react-router';



import './dashboard_page.css'; 

import LineChart from 'components/charts/LineChart'; 

function LendingInfo(props) {

  const history = useHistory(); 

  // const [userInfo, setUserInfo] = useState({});
  // const [cardIndex, setCardIndex] = useState(0);
  // const [userInfo, setUserInfo] = useState(props.userInfo); 
  // const [balance, setBalance] = useState({}); 

  const {lending} = props;
  console.log("lending: ", lending, typeof(lending))



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
        <div style={{
          border: '1px solid #F2F2F2',  
          borderRadius: '5px', 
          marginBottom: '50px'
        }}>
          <div style={{
            padding: '5px', 
            fontSize: '14px', 
          }}>지갑 총액</div>
          <div style={{
            padding: '5px', 
            fontSize: '12px'
          }}>₩ 10,000,000</div>
          <LineChart /> 
        </div>
        <div style={{fontSize: '10px'}}>
          {lending.supply_token && JSON.stringify(lending)}

        </div>
      </>
  )
}

export default withRouter(LendingInfo)