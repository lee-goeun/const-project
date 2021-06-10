import React from 'react'; 

import {Row, Col} from 'react-bootstrap'; 

import { withRouter } from 'react-router';

import DoughnutChart from 'components/charts/DoughnutChart'; 
import klaytn_img from 'static/img/token_icon/klaytn_logo.png'; 
import bsc_img from 'static/img/token_icon/bsc_logo.png'; 



function WalletInfo(props) {

  const {balance, atype} = props;

  return ( 
      <>
        <Row style={{height: '50px'}}>
          <Col xs={1}>
            {atype == 'Klaytn' ? <img src={klaytn_img} /> : <img src={bsc_img} />}
          </Col>
          <Col>
              {atype == 'Klaytn' ? 
                <span style={{fontSize: '15px', fontWeight: 'bold'}}>Klaytn</span> : 
                <span style={{fontSize: '15px', fontWeight: 'bold'}}>Binance Smart Chain</span>
              }
          </Col>
        </Row>
        <div style={{
          height: '200px'
        }}>
          <DoughnutChart data={balance.tokens}/>
        </div>
      </>
  )
}

export default withRouter(WalletInfo)