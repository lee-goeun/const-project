import React from 'react'; 

import {Row, Col, Button} from 'react-bootstrap'; 

import { withRouter } from 'react-router';

import DoughnutChart from 'components/charts/DoughnutChart'; 
import klaytn_img from 'static/img/token_icon/klaytn_logo.png'; 
import bsc_img from 'static/img/token_icon/bsc_logo.png'; 



function WalletInfo(props) {

  const {balance, atype} = props;

  return ( 
      <div className='wallet-coin-item'>
        <Row xs={10} style={{height: '40px'}}>
          <Col xs={1}>
            {atype == 'Klaytn' ? <img src={klaytn_img} /> : <img src={bsc_img} />}
          </Col>
          <Col xs={8}> 
              {atype == 'Klaytn' ? 
                <span style={{fontSize: '15px', fontWeight: 'bold'}}>KLAY</span> : 
                <span style={{fontSize: '15px', fontWeight: 'bold'}}>KSP</span>
              }
              <div style={{
                margin: '0 0 0 10px',
                padding: '1px 3px',
                fontSize: '12px',
                display: 'inline',
                color: '#615EFF',
                border: '0.5px solid #615EFF',
                borderRadius: '5px'
              }}>▾ 89.30 %</div>
          </Col>
          <Col xs={1}>
            <Button 
              className="font-size-resolver"
              style={{
                width: 'auto',
                marginRight: '0',
                color: '#FFFFFF', 
                backgroundColor: '#95B1F9',
                border: '#E0E0E0'}}
              >
              Trade
            </Button>
          </Col>
        </Row>
        {/* <div style={{
          height: '200px'
        }}>
          <DoughnutChart data={balance.tokens}/>
        </div> */}
        <div className='wallet-grid-container' style={{margin: '0'}}>
          <div className='wallet-grid'>
            <p style={{ flex: '1'}}>보유 수량</p> <p style={{ flex: '1', textAlign: 'right'}}>0.9352 KLAY</p>
          </div>
          <div className='wallet-grid'>
            <p style={{ flex: '1'}}>단가</p> <p style={{ flex: '1', textAlign: 'right'}}>₩1,198</p>
          </div>
          <div className='wallet-grid'>
            <p style={{ flex: '1'}}>평가 금액</p> <p style={{ flex: '1', textAlign: 'right'}}>₩5,860,000</p>
          </div>
          {/* <div className='wallet-grid'>
            <p style={{ flex: '1'}}>매수 금액</p> <p style={{ flex: '1', textAlign: 'right'}}>₩1,000,000</p>
          </div> */}
        </div>
      </div>
  )
}

export default withRouter(WalletInfo)