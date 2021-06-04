import React, {useState} from 'react'; 
import { Link } from 'react-router-dom'; 

import {Container, Row, Col, Button} from 'react-bootstrap'; 

import { useHistory } from 'react-router-dom'; 
import { useDispatch } from 'react-redux'; 
import { signinUser } from '_actions/user_action';
import { withRouter } from 'react-router';

import CloseIcon from '@material-ui/icons/Close';

import { 
  Checkbox, 
  FormControl, 
  Input, 
  InputLabel 
} from '@material-ui/core';

import './signin_page.css'

function SigninPage(props) {

  const dispatch = useDispatch(); 
  const history = useHistory(); 

  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [statusMessage, setStatusMessage] = useState(setFormStatusMessage(""));


  // React.useEffect(() => { })


  const onEmailHandler = (event) => { 
    let email = event.currentTarget.value; 
    // if (!email) {
    //   setStatusMessage(setFormStatusMessage("먼저 로그인이 필요해요:)"));  
    //   return; 
    // }

    setEmail(email); 
    setStatusMessage(setFormStatusMessage(""));
  }
  const onPasswordHandler = (event) => { setPassword(event.currentTarget.value); }

  function setFormStatusMessage(msg, status=true) { 
    if (!msg) { return (<span style={{fontSize: '12px'}}>&nbsp;</span>)};
    return (
      <span
        style={{
          fontSize: '12px',
          color: status ? '#615EFF' : '#F63131'
      }}>
        {msg}
      </span>
    )
  }

  const onSubmitHandler = (event) => {
    event.preventDefault();
    const user_data = {email, password}; 
    dispatch(signinUser(user_data))
      .then(res => { 
        if(res.payload.success) { 
          history.push('/dashboard')
        } else { 
          setStatusMessage(setFormStatusMessage("아이디 또는 비밀번호가 일치하지 않습니다.", false));
        }
      })
  }

  return ( 
    <Container style={{padding: '3px'}}>
      <Row 
        className="align-items-start"
        style={{height:'120px', paddingTop: '30px'}}>
      
        <Col style={{textAlign: 'end'}}>
          <CloseIcon 
            onClick={() => {props.history.goBack();}} 
          />
        </Col>
      </Row>
      <Row 
        className="align-items-end"
        style={{
          height: '120px',
          textAlign: 'left', 
          paddingBottom: '10px'}}>
        <Col md={12}>
          <div
            style={{
              fontSize: '19px',
              fontWeight: 'bold'
            }}
          >로그인</div>
        </Col>
      </Row> 
      <Row 
        className='align-items-end'
        style={{
          textALign: 'center',
          paddingTop: '20px', 
        }}>
        <Col>
          <div className='input-box'> 
            <FormControl fullWidth={true}>
              <InputLabel style={{
                color:'#828282', 
                padding: '5px 0 0 8px',
                fontSize: '15px'
                }}>
                이메일
              </InputLabel>
              <Input 
                disableUnderline={true}
                placeholder="example@email.com"
                style={{padding: '0 0 2px 8px'}}
                onChange={onEmailHandler}
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
          <div className='input-box'> 
            <FormControl fullWidth={true}>
              <InputLabel style={{
                color:'#828282', 
                padding: '5px 0 0 8px', 
                fontSize: '15px'
                }}>
                비밀번호
              </InputLabel>
              <Input 
                disableUnderline={true}
                placeholder="비밀번호"
                type="password"
                style={{padding: '0 0 5px 8px'}}
                onChange={onPasswordHandler}
              >
              </Input>
            </FormControl>
          </div>
        </Col>
      </Row>
      <Row style={{height: '80px', marginTop: '5px'}}>
        <Col xs={8} style={{textAlign: 'left'}}>
          {statusMessage}
        </Col>
        <Col xs={4}  style={{textAlign: 'right'}}>
          <Checkbox 
            size="small"
            color="primary"
            style={{padding: '0'}}
          />
          <span style={{fontSize: '12px', paddingLeft: '5px'}}>자동로그인</span>
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
            onClick={onSubmitHandler}
            >
            로그인
          </Button>
        </Col>
      </Row>
      <Row style={{paddingTop: '15px'}}>
        <Col>
          <span style={{fontSize: '13px'}}>비밀번호를 잃으셨나요?</span>
          <span style={{fontSize: '13px', marginLeft: '8px', color:'#95B1F9'}}>비밀번호 재설정</span>
        </Col>
      </Row>

      <Row 
        className='align-items-end'
        style={{
          width: '100%', 
          height: '120px',
          margin: '0 auto', 
      }}>
        <Col>
          <span style={{fontSize: '13px'}}>아직 회원이 아니신가요?</span>
          <Link to="/signup">
            <span style={{fontSize: '13px', marginLeft: '8px', color:'#615EFF'}}>회원가입 &gt; </span>  
          </Link>
        </Col>
      </Row>
    </Container>
  )
}

export default withRouter(SigninPage)