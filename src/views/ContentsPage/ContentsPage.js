import React, {useState} from 'react'; 

import {Container, Row, Col, Button} from 'react-bootstrap'; 
import axios from 'axios'; 

import { useHistory } from 'react-router-dom'; 
import { useDispatch } from 'react-redux'; 
import { withRouter } from 'react-router';

import { auth } from '_actions/user_action'; 

import NavBar from 'components/NavBar';

function ContentsPage(props) {

  const dispatch = useDispatch(); 
  const history = useHistory(); 

  const [userInfo, setUserInfo] = useState({});

  React.useEffect(() => { 
    dispatch(auth()).then(res => { 
      if (res.payload) { 
        setUserInfo(res.payload); 
      }
    })
  }, [])

  const logoutHandler = () => { 
    axios.get('/api/user/logout')
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
    <Container>
      <Row 
        className="align-items-center"
        style={{height:'100px', textAlign: 'center'}}>
        <Col>
          <p style={{fontSize: '35px', color: '#4472c4'}}>
            컨텐츠 임시 페이지
          </p>
        </Col>
        <Col>
          <p>{userInfo && userInfo.name}님 환영합니다.</p>
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
            onClick={() => { history.push('/')} }
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
      <NavBar contents={true} />
    </Container>
  )
}

export default withRouter(ContentsPage)