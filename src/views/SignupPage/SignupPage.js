import React from 'react'; 
import axios from 'axios'; 


import {Container, Row, Col, Button} from 'react-bootstrap'; 
import Form from 'react-bootstrap/Form'; 

class Signup extends React.Component {

  constructor(props) { 
    super(props); 
    this.state = { 
      name: "", 
			email: "", 
			password: "", 
			password_check: "", 
			agree_check: false, 
    }
  }

  handleName = e => { this.setState({ name: e.target.value}); };
	handleEmail = e => { this.setState({ email: e.target.value}); };
	handlePassword = e => { this.setState({ password: e.target.value}); };
	handlePasswordCheck = e => { this.setState({ password_check: e.target.value}); };
	handleAgreeCheck = () => { this.setState({ agree_check: !this.state.agree_check}); };

  goBackPage = () => { 	
	  this.props.history.goBack(); 
  }
  
  submitSignUp = () => {
		if (!this.state.agree_check) { 
			alert("약관 동의를 클릭해 주세요!")
			return; 
		}

		for (let _elem in this.state)	{ 
			if (!this.state[_elem]) { 
				alert("모든 내용을 기입해 주세요!")
				return; 
			}
		}

		if (this.state.password !== this.state.password_check) { 
			alert("비밀번호와 비밀번호 확인 내용이 다릅니다!");
			return; 
		}

    const { email, name, password } = this.state; 
    const user_data = {email, name, password}; 

    axios.post('/api/users/signup', user_data)
      .then(res => { 
        if (res.data.status === "success") { 
          alert("성공적으로 회원가입이 되었습니다!"); 
          this.props.history.push("/signin"); 
        }
    }).catch(error => {
      console.log("Error: ", error); 
      alert("오류가 발생하였습니다. 관리자에게 문의해 주세요"); 
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
                                <label>이름</label>
                                <input 
																	type="text" 
																	className="form-control" 
																	placeholder="이름"  
																	value={this.state.name}
																	onChange={this.handleName}
																/>
                            </div>
                        </Col>
                    </Row>
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
										<Row style={{padding: '5px 0 5px 0'}}>
                        <Col>
                            <div className="form-group">
                                <label>비밀번호 확인</label>
                                <input 
																	type="password" 
																	className="form-control" 
																	placeholder="비밀번호 확인" 
																	value={this.state.password_check}
																	onChange={this.handlePasswordCheck}
																/>
                            </div>
                        </Col>
                    </Row>
                </form>
            </Col>
          </Row>
					<Row>
						<Col>
							<Form.Group>
								<Form.Check 
									type="checkbox" 
									label="약관을 동의하였습니다" 
									value={this.state.agree_check}
									onChange={this.handleAgreeCheck}
									className="text-justify"
									style={{paddingLeft: '30px'}}
								/>
							</Form.Group>
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
								onClick={this.submitSignUp}
                >
                회원가입
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Signup;
