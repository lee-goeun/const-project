import React, {useState} from 'react'; 

import {Container, Row, Col, Button} from 'react-bootstrap'; 
import axios from 'axios'; 

import { useHistory } from 'react-router-dom'; 
import { useDispatch } from 'react-redux'; 
import { signinUser } from '_actions/user_action';
import { withRouter } from 'react-router';



function SigninPage(props) {

  const dispatch = useDispatch(); 
  const history = useHistory(); 

  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 

  React.useEffect(() => { })


  const onEmailHandler = (event) => { setEmail(event.currentTarget.value); }
  const onPasswordHandler = (event) => { setPassword(event.currentTarget.value); }


  const onSubmitHandler = (event) => {
    event.preventDefault();
    const user_data = {email, password}; 
    dispatch(signinUser(user_data))
      .then(res => { 
        if(res.payload.success) { 
          history.push('/dashboard')
        } else { 
          alert('error')
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
              해쉬브라운
            </p>
          </Col>
        </Row>
        <Row style={{textAlign: 'left', fontSize: '18px', height: '400px'}}>
          <Col>
              <form>
                  <Row style={{padding: '5px 0 5px 0'}}>
                      <Col>
                          <div className="form-group">
                              <label>이메일 계정</label>
                              <input 
                                type="email" 
                                className="form-control" 
                                placeholder="abc@example.com" 
                                onChange={onEmailHandler}
                              />
                          </div>
                      </Col>
                  </Row>
                  <Row style={{padding: '5px 0 5px 0'}}>
                      <Col>
                          <div className="form-group">
                              <label>비밀번호</label>
                              <input 
                                type="password" 
                                className="form-control" 
                                placeholder="비밀번호 입력" 
                                onChange={onPasswordHandler}
                              />
                          </div>
                      </Col>
                  </Row>
              </form>
          </Col>
        </Row>
        
        <Row style={{padding: '20px 0 20px 0'}}>
          <Col>
            <Button 
              style={{
                width: '100%', 
                color: 'black', 
                backgroundColor: 'white', 
                borderColor: '#bcbcbc'}}
              onClick={() => { history.goBack()}}
              >
              이전으로
            </Button>
          </Col>
          <Col>
            <Button 
              style={{
                width: '100%', 
                color: 'white', 
                backgroundColor: '#4472c4', 
                borderColor: '#4472c4'}}
              type="submit"
              onClick={onSubmitHandler}
              >
              로그인
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default withRouter(SigninPage)