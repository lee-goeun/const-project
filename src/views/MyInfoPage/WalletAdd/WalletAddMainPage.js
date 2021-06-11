import React from 'react'; 

import {Container, Row, Col} from 'react-bootstrap'; 

import { useHistory } from 'react-router-dom'; 
import { withRouter } from 'react-router';

import NavBar from 'components/NavBar';

import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

function WalletAddMainPage(props) {

  const history = useHistory(); 

  return ( 
    <Container style={{padding: '0'}}>

      <Row 
        className="align-items-end"
        style={{
          height:'50px', 
          textAlign: 'left', 
          marginBottom: '20px'
      }}>
        <Col xs={1} style={{textAlign: 'left'}}>
          <ArrowBackIosIcon onClick={() => { history.goBack(); }} />
        </Col>
        <Col>
          <span style={{
            fontSize: '15px', 
            fontWeight: 'bold'
          }}>지갑 추가</span>
        </Col>
      </Row>
      <Row
        onClick={() => {history.push('/myinfo/wallet/create')}} 
      >
        <Col> 
          <div 
            className='align-items-center'
            style={{
            border: '1px solid #F2F2F2',  
            borderRadius: '5px', 
          }}>
            <p style={{
              marginTop: '16px', 
              fontSize: '14px', 
              fontWeight: 'bold'
            }}>새 지갑 주소 생성</p>
            <p style={{
              fontSize: '12px'
            }}>네트워크를 선택하여 새로운 지갑 주소 생성</p>
          </div>
        </Col>
      </Row>
      <Row
        onClick={() => {history.push('/myinfo/wallet/import')}} 
        style={{marginTop: '20px'}}>
        <Col> 
          <div 
            className='align-items-center'
            style={{
            border: '1px solid #F2F2F2',  
            borderRadius: '5px', 
          }}>
            <p style={{
              marginTop: '16px', 
              fontSize: '14px', 
              fontWeight: 'bold'
            }}>지갑 주소로 추가</p>
            <p style={{
              fontSize: '12px'
            }}>지갑 주소 입력 혹은 QR코드로 연결</p>
          </div>
        </Col>
      </Row>
      <NavBar myinfo={true} />
    </Container>
  )
}

export default withRouter(WalletAddMainPage)