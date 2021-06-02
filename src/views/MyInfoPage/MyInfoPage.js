import React, {useState} from 'react'; 

import {Container, Row, Col, Button} from 'react-bootstrap'; 
import axios from 'axios'; 

import { useHistory } from 'react-router-dom'; 
import { useDispatch } from 'react-redux'; 
import { withRouter } from 'react-router';

import { auth } from '_actions/user_action'; 

import NavBar from 'components/NavBar';

function MyInfoPage(props) {

  const dispatch = useDispatch(); 
  const history = useHistory(); 

  const [Name, setName] = useState('')

  React.useEffect(() => { 
    dispatch(auth()).then(response => { 
      if (response.payload.hasOwnProperty('name')) { 
        setName(response.payload.name); 
      }
    })
  })


  return ( 
    <Container>
      <Row 
        className="align-items-center"
        style={{height:'100px', textAlign: 'center'}}>
        <Col>
          <p style={{fontSize: '35px', color: '#4472c4'}}>
            마이페이지
          </p>
        </Col>
        <Col>
          <p>{Name}님 환영합니다.</p>
        </Col>
      </Row>
      <NavBar myinfo={true} />
    </Container>
  )
}

export default withRouter(MyInfoPage)