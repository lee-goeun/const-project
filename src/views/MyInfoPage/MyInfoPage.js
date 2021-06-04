import React, {useState} from 'react'; 

import {Container, Row, Col, Button} from 'react-bootstrap'; 
import axios from 'axios'; 

import { useHistory } from 'react-router-dom'; 
import { useDispatch } from 'react-redux'; 
import { withRouter } from 'react-router';

import { auth } from '_actions/user_action'; 
import NavBar from 'components/NavBar';

import Divider from '@material-ui/core/Divider';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

import user_default_img from 'static/img/user_icon/user_default.png'; 
import private_management_img from 'static/img/user_icon/private_management.png';
import wallet_img from 'static/img/user_icon/wallet.png';


function MyInfoPage(props) {

  const dispatch = useDispatch(); 
  const history = useHistory(); 

  const [userName, setUserName] = useState(''); 
  const [userEmail, setUserEmail] = useState(''); 

  React.useEffect(() => { 
    dispatch(auth()).then(res => { 
      if (res.payload.hasOwnProperty('name')) { 
        const { name, email } = res.payload; 
        setUserName(name);
        setUserEmail(email); 
      }
    })
  }, [])


  return ( 
    <Container>
      <Row 
        className="align-items-center"
        style={{
          height:'120px'
      }}>
        <Col xs={2}>
          <img src={user_default_img} />
        </Col>
        <Col style={{
          textAlign: 'left'
        }}>
          <div style={{
            fontSize: '15px', 
            fontWeight: 'bold', 
            height: '30px'
          }}>{userName}</div>
          <div style={{
            fontSize: '12px'
          }}>{userEmail}</div>
        </Col>
      </Row>
      <Row style={{
        position: 'absolute', 
        left: '0', 
        width: '150%'
        }}>
        <Col>
          <div style={{
            width: '100%', 
            height: '10px', 
            backgroundColor: '#E0E0E0'
          }}/>
        </Col>
      </Row>
      <Divider absolute={true} />
      <Row 
        className='align-items-center'
        style={{
        textAlign: 'left', 
        marginTop: '20px',
        height: '60px'
      }}>
        <Col xs={1}>
          <img src={private_management_img} />
        </Col>
        <Col>
          <span>로그인 관리</span>
        </Col>
        <Col style={{textAlign: 'right'}}>
          <ArrowForwardIosIcon style={{
            fontSize: '15px', 
            color: '#BDBDBD'}} 
          />
        </Col>
      </Row>
      <Divider />
      <Row 
        className='align-items-center'
        style={{
          textAlign: 'left', 
          height: '60px'
        }}>
        <Col xs={1}>
          <img src={wallet_img} />
        </Col>
        <Col>
          <span>지갑 관리</span>
        </Col>
        <Col style={{textAlign: 'right'}}>
          <ArrowForwardIosIcon style={{
            fontSize: '15px', 
            color: '#BDBDBD'}} 
          />
        </Col>

      </Row>
      <NavBar myinfo={true} />
    </Container>
  )
}

export default withRouter(MyInfoPage)