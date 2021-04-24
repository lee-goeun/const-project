import React, {useState} from 'react'; 

import {Container, Row, Col, Button} from 'react-bootstrap'; 
import logoImg from 'static/img/logo.png'; 
import googleLogoImg from 'static/img/google_logo.png'; 

import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';


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
      display: 'table', 
      }}>
      <Container>
        <Row 
          className="align-items-top"
          style={{height:'70px', textAlign: 'left', paddingTop: '10px'}}>
          <Col>
            <ArrowBackIosIcon onClick={() => { history.goBack()}} />
            <span style={{fontSize: '20px'}}>
              로그인
            </span>
          </Col>
        </Row>
        <Row>
          <Col>
            <img 
              src={logoImg} 
              style={{padding: '20px 0 20px 0'}}
              />
          </Col>
        </Row>
        <Row style={{textAlign: 'left', fontSize: '14px', padding: '0 30px 0 30px'}}>
          <Col xs="12" style={{padding: '10px'}}>
            <input 
              type="email" 
              className="form-control" 
              placeholder="아이디 입력" 
              onChange={onEmailHandler}
            />
          </Col>
          <Col xs="12" style={{padding: '10px'}}>
            <input 
              type="password" 
              className="form-control" 
              placeholder="4-8자리의 숫자,영문,특수기호 사용" 
              onChange={onPasswordHandler}
            />
          </Col>
          <Col xs="12" style={{padding: '0 10px 10px 10px'}}>
            <input 
              type="checkbox" 
            /> 
            <span style={{paddingLeft: '5px'}}>아이디 저장</span>
          </Col>
        </Row>
        <Row style={{padding: '0 30px 0 30px'}}>
          <Col xs="12">
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
          <Col xs="12" style={{fontSize: '12px', padding: '10px'}}>
            <span>비밀번호 재설정</span>
            <span> | </span>
            <span onClick={() => {history.push('/signup')}}>회원가입</span>
          </Col>
        </Row>
        <Row style={{padding: '0 80px 0 80px'}}>
          <Col xs="12" style={{padding: '5px 5px'}}>
            <Button
              style={{
                width: '100%', 
                color: 'black', 
                backgroundColor: '#FFD114', 
                borderColor: '#FFD114', 
                fontSize: '12px'}}
              type="submit"
            >카카오로 로그인
            </Button>
          </Col>
          <Col xs="12" style={{padding: '5px 5px'}}>
            <Button
              style={{
                width: '100%', 
                color: 'black', 
                backgroundColor: '#19CE60', 
                borderColor: '#19CE60', 
                fontSize: '12px'}}
              type="submit"
            >네이버로 로그인
            </Button>
          </Col>
          <Col xs="12" style={{padding: '5px 5px'}}>
            <Button
              style={{
                width: '100%', 
                color: 'black', 
                backgroundColor: '#fff', 
                borderColor: '#000', 
                fontSize: '12px'}}
              type="submit"
            >
              <img 
              src={googleLogoImg} 
              style={{}}
              />
              Google로 로그인
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default withRouter(SigninPage)