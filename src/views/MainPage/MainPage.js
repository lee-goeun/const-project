import React, { useEffect, useState } from 'react'; 
import { Link } from 'react-router-dom'; 
import { useScrollFadeIn } from 'hooks'; 

import {Container, Row, Col, Button} from 'react-bootstrap'; 
import logoImg from 'static/img/logo.png'; 

const MainPage = () => {

  const animatedItem = { 
    0: useScrollFadeIn('up',    1,    0, 0.3),
    1: useScrollFadeIn('up',    1,  0.3, 0.3),
    2: useScrollFadeIn('up',  1.5,  1.2, 0.3),
  };

  return  ( 
    <div style={{
        width: '100%', 
        display: 'table', 
        }}>
      <Container style={{padding: '20px'}}>
        <Row>
          <Col>
            <img 
              src={logoImg} 
              style={{paddingTop: '60px'}}
            />
          </Col>
        </Row>
        <Row 
          className="justify-content-center align-items-end"
          style={{height:'150px', textAlign: 'left'}}
          >
          <Col {...animatedItem[0]}>
            <span className="text-justify" style={{fontSize: '24px', fontWeight: 'bold'}} >
              당신의 미래를 바꾸는 <br/>
            </span>
            <span className="text-justify" style={{fontSize: '28px', color: '#4472c4', fontWeight: 'bold'}}>
              크립토 금융
            </span>
            <span className="text-justify" style={{fontSize: '24px', fontWeight: 'bold'}}>
              의 시작
            </span>
          </Col>
        </Row>
        <Row {...animatedItem[1]} > 
          <Col md={12} style={{padding: '10px'}}>
            <p 
              className="text-justify" 
              style={{fontSize: '35px', fontWeight: 'bold', color: '#4472c4', paddingLeft: '5px'}} 
              >
                해쉬브라운
            </p>
          </Col>
        </Row>
        <Row  {...animatedItem[2]}>
          <Col md={12} style={{padding: '10px'}}>
            <Link to="/signin">
              <Button 
                style={{
                  width: '100%', 
                  color: 'black', 
                  backgroundColor: 'white', 
                  borderColor: '#bcbcbc', 
                  fontWeight: 'bold'}}
                >
                로그인
              </Button>
            </Link>
          </Col>
          <Col md={12} style={{padding: '10px'}}>
            <Link to="/signup">
              <Button 
                style={{
                  width: '100%', 
                  color: 'white', 
                  backgroundColor: '#4472c4', 
                  borderColor: '#4472c4', 
                  fontWeight: 'bold'}}
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

export default MainPage;
