import React, { useEffect, useState } from 'react'; 
import { Link } from 'react-router-dom'; 
import { useScrollFadeIn } from '../hooks'; 

import axios from 'axios'; 

import {Container, Row, Col, Button} from 'react-bootstrap'; 

const Main = () => {

  const animatedItem = { 
    0: useScrollFadeIn('up',     1,   0, 0.3),
    1: useScrollFadeIn('up',     1, 0.3, 0.3),
    2: useScrollFadeIn('up',     1.5, 1.2, 0.3),
  };

  const userNameState = {
    userName: ""
  };

  const [userName, setUserName] = useState(userNameState); 

  useEffect(() => { 
    axios.post('/api/test')
      .then(res => { 
        setUserName({ 
          userName: res.data.userName
        })
    })
  }, []);
  return  ( 
    <div style={{
        width: '100%', 
        // height: '1000px', 
        display: 'table', 
        }}>
      <Container style={{padding: '20px'}}>
        <Row 
          className="justify-content-center align-items-end"
          style={{height:'380px', textAlign: 'left'}}
          >
          <Col {...animatedItem[0]}>
            {/* <h2>
              {userName ? `Hello ${userName}` : 'No User Login'}
            </h2> */}
            <p className="text-justify" style={{fontSize: '35px'}} >
              당신 만을 위한 <br/> 내 손안의
            </p>
          </Col>
        </Row>
        <Row style={{textAlign: 'left', fontSize: '25px'}}>
          <Col {...animatedItem[1]}>
            <p className="text-justify" style={{fontSize: '35px', color: 'orange'}} >
              자산관리사
            </p>
          </Col>
        </Row>
        <Row  {...animatedItem[2]}>
          <Col md={12} style={{padding: '10px'}}>
            <Button 
              style={{
                width: '100%', 
                color: 'black', 
                backgroundColor: 'white', 
                borderColor: '#bcbcbc'}}
              >
              로그인
            </Button>
          </Col>
          <Col md={12} style={{padding: '10px'}}>
            <Link to="/signup">
            <Button 
              style={{
                width: '100%', 
                color: 'white', 
                backgroundColor: 'orange', 
                borderColor: 'orange'}}
              >
              회원가입
            </Button>
            </Link>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Main;
