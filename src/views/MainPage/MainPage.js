import React from 'react'; 
import { Link } from 'react-router-dom'; 

import {Container, Row, Col, Button} from 'react-bootstrap'; 
import logoImgLarge from 'static/img/logo_large.png'; 
// import logoImg from 'static/img/logo.png'; 
import Anime from 'react-anime'; 

const MainPage = () => {

  return  ( 
    <div style={{
        width: '100%', 
        display: 'table', 
        }}>
      <Container>
      <Row 
          className="align-items-end"
          style={{height:'200px'}}
          >
          <Col md={12}>
            <Anime
              easing="easeInSine"
              duration={500}
              delay={3000}
              direction="normal"
              translateY="-10px"
              opacity={[0, 1]}
            >
              <div style={{
                textAlign: 'left', 
                fontSize: '19px',
                color:'#333', 
                fontWeight: 'bold'}} 
              >
                암호화폐와 금융을 연결하다. <br/>
                당신의 새로운 금융 파트너
              </div>
            </Anime>
          </Col>
        </Row>
        <Row 
        style={{height: '200px', paddingTop: '50px'}}>
          <Col
            className="justify-content-start">
            <Anime
              easing="easeInSine"
              duration={1000}
              delay={2000}
              direction="normal"
              translateY="-0px"
              // translateX="-120px"
              scale={[.5, 1]}
            >
            <img 
              
              src={logoImgLarge} 
              style={{
                width: '70%', 
                height: '70%', 
                paddingRight: '11px', 
                paddingTop: '0px'}}
            />
            </Anime>
          </Col>
        </Row>
        <Row 
          className="justify-content-center"
          style={{ position: 'absolute', bottom: '20px', left: '0'}}>
          <Anime
            easing="easeInSine"
            duration={500}
            delay={3500}
            direction="normal"
            translateY="-20px"
            opacity={[0, 1]}
          >
            <Col md={12}>
              <Link to="/signin">
                <Button 
                  style={{
                    width: '320px', 
                    height: '50px', 
                    color: 'white', 
                    backgroundColor: '#615EFF', 
                    borderColor: '#615EFF', 
                    fontSize: '14px', 
                    fontWeight: 'bold'}}
                  >
                  시작하기
                </Button>
              </Link>
            </Col>
            <Col md={12}>
              <Link to="/signup">
                <Button 
                  style={{
                    width: '320px', 
                    height: '50px', 
                    color: '#808080', 
                    backgroundColor: '#fff', 
                    borderColor: '#fff', 
                    fontSize: '14px', 
                    fontWeight: 'bold'}}
                  >
                  서비스 둘러보기
                </Button>
              </Link>
            </Col>
          </Anime>
        </Row>
      </Container>
    </div>
  );
}

export default MainPage;
