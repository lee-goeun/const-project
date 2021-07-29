import React from 'react'; 

import { withRouter } from 'react-router';

import { IconButton } from "@material-ui/core";
import Menu from '@material-ui/icons/Menu';
import { Row, Col, Button } from 'react-bootstrap'; 
import logo_img from "static/img/logo_img.png";


function PortfolioMain(props) {

  return ( 
    <>
      <Row
        className="align-items-end"
        style={{
          height: "90px",
          paddingBottom: '10px'
        }}
      >
        <Col xs={4} style={{ textAlign: "left" }}>
          <img src={logo_img} style={{ width: "100%" }} />
        </Col>
        <Col style={{ textAlign: "right" }}>
          <IconButton color="black" component="span" size="large" >
            <Menu style={{fontSize: '120%'}} />
          </IconButton>
        </Col>
      </Row>
      <Row>
        <Col style={{ marginTop: '20px', marginLeft: '10px', textAlign: 'left' }}>
          <h5 style={{ fontWeight: '600' }}>반가워요, 춤추는 올빼미 님</h5>
        </Col>
      </Row>
      <Row>
        <Col align='center' style={{ marginTop: '20px' }}>
          <div style={{ width: '90vw', backgroundColor: '#615EFF', borderRadius: '5px', boxShadow: '0px 0px 14px -1px rgba(0,0,0,0.4)' }}>
            <span 
              style={{ 
                padding: '10px',
                color: '#A2B9FC', 
                display: 'flex', 
                flexDirection: 'row', 
                justifyContent: 'space-between',
              }}
            >
              <p style={{ fontSize: '1em' }}>순자산</p>
              <p style={{ color: '#F2F2F2', fontSize: '1.2em' }}>0원</p>
            </span>
            <span 
              style={{ 
                padding: '10px',
                color: '#A2B9FC', 
                display: 'flex', 
                flexDirection: 'row', 
                justifyContent: 'space-between',
              }}
            >
              <p style={{ fontSize: '1em' }}>총자산</p>
              <p style={{ color: '#F2F2F2', fontSize: '1.2em' }}>0원</p>
            </span>
            <span 
              style={{ 
                padding: '10px',
                color: '#A2B9FC', 
                display: 'flex', 
                flexDirection: 'row', 
                justifyContent: 'space-between',
              }}
            >
              <p style={{ fontSize: '1em' }}>총부채</p>
              <p style={{ color: '#F2F2F2', fontSize: '1.2em' }}>0원</p>
            </span>
          </div>
        </Col>
        <Col style={{ margin: '20px 0' }}>
          <h5>stacked bar chart 넣는 자리</h5>
        </Col>

      </Row>
    </>
  )
}

export default withRouter(PortfolioMain)