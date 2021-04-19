import React, {useState} from 'react'; 

import {Container, Row, Col, Button} from 'react-bootstrap'; 
import axios from 'axios'; 

import { useHistory } from 'react-router-dom'; 
import { useDispatch } from 'react-redux'; 
import { withRouter } from 'react-router';

import { auth } from '_actions/user_action'; 

function DashboardPage(props) {

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

  const logoutHandler = () => { 
    axios.get('/api/users/logout')
      .then(response => { 
        if(response.data.success) { 
          props.history.push('/')
          alert('로그아웃 되었습니다.')
        } else { 
          alert('Failed to Log Out!')
        }
      })
  }

  return ( 
    <div style={{
      width: '100%', 
      // height: '1000px', 
      display: 'table', 
      }}>
      <Container style={{padding: '20px'}}>
        <Row 
          className="align-items-top"
          style={{height:'100px', textAlign: 'center'}}>
          <Col>
            <p style={{fontSize: '35px', color: '#4472c4'}}>
              대시보드
            </p>
          </Col>
          <Col>
            <p>{Name}님 환영합니다.</p>
          </Col>

        </Row>
        <Row style={{textAlign: 'left', fontSize: '18px', height: '400px'}}>
          <Col>
            <Button 
              style={{
                width: '100%', 
                color: 'black', 
                backgroundColor: 'white', 
                borderColor: '#bcbcbc'}}
              onClick={() => { history.push('/')}}
              >
              이전으로
            </Button>
            <Button 
              style={{
                width: '100%', 
                color: 'white', 
                backgroundColor: '#4472c4', 
                borderColor: '#4472c4'}}
              onClick={logoutHandler}
              >
               로그아웃
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default withRouter(DashboardPage)