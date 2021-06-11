import React from 'react';
import { useHistory } from 'react-router-dom'; 
import { withRouter } from 'react-router';


import { Row, Col } from 'react-bootstrap'; 

import home_icon from 'static/img/menu_icon/home_icon.png';
import defi_icon from 'static/img/menu_icon/defi_icon.png';
import contents_icon from 'static/img/menu_icon/contents_icon.png';
import history_icon from 'static/img/menu_icon/history_icon.png';
import user_icon from 'static/img/menu_icon/user_icon.png';

function NavBar(props) {

  const history = useHistory(); 
  const selectColorFilter = 'invert(54%) sepia(74%) saturate(6720%) hue-rotate(230deg) brightness(102%) contrast(101%)'; 

  
  return  ( 
    <Row 
      className='align-items-center justify-content-center'
      style={{
        width: '100%',
        maxWidth: '800px',
        position: 'fixed', 
        left: '0', 
        right: '0', 
        margin: '0 auto', 
        bottom: '0', 
        height: '60px', 
        fontSize:'10px', 
        textAlign: 'center', 
        color: '#828282', 
        borderTop: '1px solid #E0E0E0', 
        backgroundColor: "FFFFFF"
      }}>
      <Col onClick={() => { history.push('/dashboard') }}>
        <img src={home_icon} style={{
          filter: props.dashboard ? selectColorFilter : ''
        }}/>
        <div style={{
          marginTop: '2px', 
          color: props.dashboard ? '#000' : '#828282',
        }}>홈</div>
      </Col>
      <Col>
        <img src={defi_icon} />
        <div style={{
          marginTop: '2px', 
        }}>디파이</div>
      </Col>
      <Col onClick={() => { history.push('/contents') }}>
        <img src={contents_icon} style={{
          filter: props.contents ? selectColorFilter : ''
        }}/>
        <div style={{
          marginTop: '2px', 
          color: props.contents ? '#000' : '#828282',
        }}>컨텐츠</div>
      </Col>
      <Col>
        <img src={history_icon} />
        <div style={{
          marginTop: '2px', 
        }}>히스토리</div>
      </Col>
      <Col onClick={ () => { history.push('/myinfo') }}>
        <img src={user_icon} style={{
          filter: props.myinfo ? selectColorFilter : ''
        }}/>
        <div style={{
          marginTop: '2px',
          color: props.myinfo ? '#000' : '#828282', 
        }}>MY</div>
      </Col>
    </Row>
  )
}

export default NavBar;
