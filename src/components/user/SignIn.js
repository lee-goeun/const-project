import React from 'react'; 
import axios from 'axios'; 


import {Container, Row, Col, Button} from 'react-bootstrap'; 

class SignIn extends React.Component {

  constructor(props) { 
    super(props); 
    this.state = { 
			email: "", 
			password: "", 
    }
  }

	handleEmail = e => { this.setState({ email: e.target.value}); };
	handlePassword = e => { this.setState({ password: e.target.value}); };

  goBackPage = () => { 	
	  this.props.history.goBack(); 
  }
  
  attemptSignIn = () => {

		for (let _elem in this.state)	{ 
			if (!this.state[_elem]) { 
				alert("모든 내용을 기입해 주세요!")
				return; 
			}
		}

    const { email, password } = this.state; 
    const user_data = {email, password}; 
    axios.post('/api/users/signin', user_data)
      .then(res => { 
        if (res.data.success) { 
          alert("성공적으로 로그인이 되었습니다!"); 
          this.props.history.push("/")
        }
    })

  }

  render() { 

    return  ( 
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
																	value={this.state.email}
																	onChange={this.handleEmail}
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
																	value={this.state.password}
																	onChange={this.handlePassword}
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
                onClick={this.goBackPage}
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
								onClick={this.attemptSignIn}
                >
                로그인
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default SignIn;
