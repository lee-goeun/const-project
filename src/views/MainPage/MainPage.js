import React from 'react'; 
import { Link } from 'react-router-dom'; 

import {Container, Row, Col, Button} from 'react-bootstrap'; 
import logoImg from 'static/img/logo_img.png'; 
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
          style={{height:'400px'}}
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
                fontSize: '17px',
                color:'#000', 
                fontWeight: 'bold'}} 
              >
                암호화폐와 금융을 연결하다. <br/>
                당신의 새로운 금융 파트너
              </div>
            </Anime>
          </Col>
        </Row>
        <Row style={{height: '50px', paddingTop: '0'}}>
          <Col style={{textAlign: 'center'}}>
            <Anime
              easing="easeInSine"
              duration={1000}
              delay={2000}
              direction="normal"
              translateX="-32%"
              translateY="-20%"
              scale={[1, .6]}
            >
              <img 
                src={logoImg} 
                style={{
                  width: '70%', 
                  height: '70%'
                }}/>
            </Anime>
          </Col>
        </Row>
        <Anime
            easing="easeInSine"
            duration={500}
            delay={3500}
            direction="normal"
            translateY="-20px"
            opacity={[0, 1]}
          >
            <Row 
            className="justify-content-center align-items-end"
            style={{ 
              // position: 'absolute', bottom: '0', left: '0', 
              // padding: '0 auto', margin: '0 15px 20px 15px auto'}}
              height: '200px'
            }}>
              <Col>
                <Link to="/signin">
                  <Button 
                    style={{
                      width: '100%',
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
            </Row>
            <Row>
              <Col>
                <Link to="/signup">
                  <Button 
                    style={{
                      width: '100%',
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
            </Row>
          </Anime>
      </Container>
    </div>
  );
}

export default MainPage;
