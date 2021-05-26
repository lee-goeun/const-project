import React, {useState} from 'react'; 
import { Link } from 'react-router-dom'; 

import {Container, Row, Col, Button} from 'react-bootstrap'; 

import { useHistory } from 'react-router-dom'; 
import { useDispatch } from 'react-redux'; 
import { signinUser } from '_actions/user_action';
import { withRouter } from 'react-router';

import CloseIcon from '@material-ui/icons/Close';

import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";



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
    <Container>
      <Row 
        className="align-items-end"
        style={{
        height: '50px',
        textAlign: 'right'
      }}>
        <Col>
          <CloseIcon />
        </Col>
      </Row>
      <Row 
        className="align-items-end"
        style={{
          height: '150px',
          textAlign: 'left', 
          paddingBottom: '10px'}}>
        <Col md={12}>
          <div
            style={{
              fontSize: '19px',
              fontWeight: 'bold'
            }}
          >로그인</div>
          <div
            style={{
              fontSize: '12px',
              color: '#615EFF'
            }}>
            먼저 로그인이 필요해요:)
          </div>
        </Col>
      </Row> 
      <Row 
        style={{
          textALign: 'center',
          paddingTop: '20px'
        }}>
        <Col>
          <div style={{
            backgroundColor: '#EFF5FF', 
            borderRadius: '5px', 
            height: '50px', 

          }}> 
            <FormControl fullWidth={true}>
              <InputLabel style={{
                color:'#85AEFF', 
                padding: '0 0 5px 8px'
                }}>
                이메일
              </InputLabel>
              <Input 
                disableUnderline={true}
                placeholder="example@email.com"
                style={{padding: '0 0 5px 8px'}}
              >
              </Input>
            </FormControl>
          </div>
        </Col>
      </Row>
      <Row 
        style={{
          textALign: 'center',
          paddingTop: '20px'
        }}>
        <Col>
          <div style={{
            backgroundColor: '#EFF5FF', 
            borderRadius: '5px', 
            height: '50px', 

          }}> 
            <FormControl fullWidth={true}>
              <InputLabel style={{
                color:'#85AEFF', 
                padding: '0 0 5px 8px'
                }}>
                비밀번호
              </InputLabel>
              <Input 
                disableUnderline={true}
                placeholder="비밀번호"
                type="password"
                style={{padding: '0 0 5px 8px'}}
              >
              </Input>
            </FormControl>
          </div>
        </Col>
      </Row>
      <Row style={{height: '100px', marginTop: '20px'}}>
        <Col style={{textAlign: 'left'}}>
          <input type="checkbox" /> 
          <span style={{paddingLeft: '5px'}}>자동 로그인</span>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
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
            로그인
          </Button>
        </Col>
      </Row>
      <Row style={{paddingTop: '15px'}}>
        <Col>
          <span>비밀번호를 잃으셨나요?</span>
          <span style={{marginLeft: '8px', color:'#95B1F9'}}>비밀번호 재설정</span>
        </Col>
      </Row>

      <Row 
        style={{
          position: 'absolute', 
          width: '100%', 
          bottom: '50px', 
          left: '0',
          margin: '0 auto', 
      }}>
        <Col>
          <span>아직 회원이 아니신가요?</span>
          <Link to="/signup">
            <span style={{marginLeft: '8px', color:'#95B1F9'}}>회원가입 &gt; </span>  
          </Link>
        </Col>
      </Row>
    </Container>
    
  )
}

export default withRouter(SigninPage)