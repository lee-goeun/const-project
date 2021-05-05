import React from 'react'; 
import { Link } from 'react-router-dom'; 
import { useScrollFadeIn } from 'hooks'; 

import {Container, Row, Col, Button} from 'react-bootstrap'; 
import logoImg from 'static/img/logo.png'; 
import logoImgLarge from 'static/img/logo_large.png'; 
import Anime from 'react-anime'; 

const MainPage = () => {

  const animatedItem = { 
    0: useScrollFadeIn('up',    1,    2, 0.3),
    1: useScrollFadeIn('up',    1,  2.3, 0.3),
    2: useScrollFadeIn('up',  1.5,  3.2, 0.3),
  };

  return  ( 
    <div style={{
        width: '100%', 
        display: 'table', 
        }}>
      <Container style={{padding: '20px'}}>
        <Row style={{height: '450px'}}>
          <Col>
            <Anime
                easing="easeInSine"
                duration={1000}
                delay={2000}
                direction="normal"
                translateY="-150px"
                // translateX="-120px"
                scale={[1, 1.5]}
              >
              <img 
                src={logoImg} 
                style={{paddingRight: '11px', paddingTop: '350px'}}
              />
            </Anime>
          </Col>
        </Row>
        {/* <Row style={{height: '130px'}}>
          <Col>
            <Anime
                easing="easeInSine"
                duration={500}
                delay={2500}
                direction="normal"
                translateY="-220px"
                opacity={[0, 1]}
              >
              <img 
                src={logoImgLarge} 
                style={{width: '300px', height: '300px'}}
              />
            </Anime>
          </Col>
        </Row> */}
        <Row 
          className="justify-content-center align-items-end"
          style={{height:'50px', textAlign: 'left', paddingTop: '20px', paddingLeft: '22px'}}
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
              <span className="text-justify" style={{fontSize: '19px', color:'#666',  fontWeight: 'bold'}} >
                당신의 미래를 바꾸는 크립토 금융
              </span>
            </Anime>
          </Col>
        </Row>
        <Row
          className="justify-content-center align-items-end"
          style={{height:'50px', textAlign: 'left'}}
          >
          <Col md={12} {...animatedItem[1]}>
            <Anime
                easing="easeInSine"
                duration={500}
                delay={3000}
                direction="normal"
                translateY="-10px"
                opacity={[0, 1]}
              >
              <span 
                className="text-justify" 
                style={{fontSize: '25px', fontWeight: 'bold', color: 'black', paddingLeft: '22px'}} 
                >
                  클링크
              </span>
            </Anime>
          </Col>
        </Row>
        <Row 
          className="justify-content-center align-items-end"
          style={{ paddingTop: '70px'}}>
          <Anime
            easing="easeInSine"
            duration={500}
            delay={3500}
            direction="normal"
            translateY="-20px"
            opacity={[0, 1]}
          >
            <Col md={12}>
              <Link to="/signup">
                <Button 
                    style={{
                      width: '320px', 
                      height: '60px', 
                      color: 'white', 
                      backgroundColor: '#1152FD', 
                      borderColor: '#1152FD', 
                      fontSize: '14px', 
                      fontWeight: 'bold'}}
                    >
                    시작하기
                  </Button>
              </Link>
            </Col>
            <Col md={12}>
              <Link to="/signin">
                <Button 
                    style={{
                      width: '320px', 
                      height: '60px', 
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
