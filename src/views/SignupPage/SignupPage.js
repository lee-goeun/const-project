import React from 'react'; 
import axios from 'axios'; 

import { withRouter } from 'react-router-dom'; 
import {Container, Row, Col, Button} from 'react-bootstrap'; 
// import Form from 'react-bootstrap/Form'; 
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import SwipeableViews from 'react-swipeable-views';

export const Component = withRouter(({history, location}) => {})

class Signup extends React.Component {

  constructor(props) { 
    super(props); 
    this.state = { 
      name: "", 
			email: "", 
			password: "", 
			password_check: "", 
			agree_check: false, 
      stepIndex: 0
    }
  }

  handleName = e => { this.setState({ name: e.target.value}); };
	handleEmail = e => { this.setState({ email: e.target.value}); };
	handlePassword = e => { this.setState({ password: e.target.value}); };
	handlePasswordCheck = e => { this.setState({ password_check: e.target.value}); };
	handleAgreeCheck = () => { this.setState({ agree_check: !this.state.agree_check}); };
  handleChangeStep = stepIndex => { this.setState({stepIndex, }); }; 
  handleNextStep = () => { this.setState({stepIndex: this.state.stepIndex+1})}

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

    const aggreChecked = this.state.agree_check; 
    const { stepIndex } = this.state; 
    let chk_status; 
    if (aggreChecked) { 
      chk_status = <CheckCircleRoundedIcon 
                      onClick={this.handleAgreeCheck} 
                      style={{fontSize: 'large'}}
                    />;
    } else { 
      chk_status = <CheckCircleOutlineRoundedIcon
                      onClick={this.handleAgreeCheck} 
                      style={{fontSize: 'large'}}
                    />;
    }

    return  ( 
      <div style={{
          width: '100%', 
           display: 'table', 
          }}>
        <Container >
          <Row 
            className="align-items-top"
            style={{height:'100px', textAlign: 'left', paddingTop: '10px'}}>
            <Col>
              <ArrowBackIosIcon onClick={this.goBackPage} />
              <span style={{fontSize: '20px', paddingTop: '20px'}}>
                회원가입
              </span>
            </Col>
          </Row>
          <Row>
            <Col>
              <table style={{marginLeft: 'auto', marginRight: 'auto'}}>
                <tbody>
                  <tr>
                    <td style={{padding: '0 5px 0 5px'}}>
                      <span style={{ backgroundColor: stepIndex == 0 ? '#4472c4' : '#fff', width: '10px', height: '10px', borderStyle: 'solid', borderWidth: '1px', borderColor: '#b2b2b2', borderRadius: '50%', display: 'inline-block'}} />
                    </td>
                    <td style={{padding: '0 5px 0 5px'}}>
                      <span style={{ backgroundColor: stepIndex == 1 ? '#4472c4' : '#fff', width: '10px', height: '10px', borderStyle: 'solid', borderWidth: '1px', borderColor: '#b2b2b2', borderRadius: '50%', display: 'inline-block'}} />
                    </td>
                    <td style={{padding: '0 5px 0 5px'}}>
                      <span style={{ backgroundColor: stepIndex == 2 ? '#4472c4' : '#fff', width: '10px', height: '10px', borderStyle: 'solid', borderWidth: '1px', borderColor: '#b2b2b2', borderRadius: '50%', display: 'inline-block'}} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>
          <Row style={{textAlign: 'center', fontSize: '18px', height: '400px'}}>
            <SwipeableViews index={stepIndex} onChangeIndex={this.handleChangeStep}>
              <div style={Object.assign({})}>
                {chk_status}
                <span>약관을 동의하셨습니다.</span>
                <Button 
                  style={{
                    width: '100%', 
                    color: 'white', 
                    backgroundColor: '#4472c4', 
                    borderColor: '#4472c4'}}
                  type="submit"
                  onClick={this.handleNextStep}
                  >
                  다음
                </Button>
              </div>
              <div style={Object.assign({})}>
                <Row style={{textAlign: 'left'}}>
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
                <Button 
                  style={{
                    width: '100%', 
                    color: 'white', 
                    backgroundColor: '#4472c4', 
                    borderColor: '#4472c4'}}
                  type="submit"
                  onClick={this.handleNextStep}
                  >
                  회원가입 
                </Button>
                </div>
              <div style={Object.assign({})}>
                비밀암호
                <Button 
                  style={{
                    width: '100%', 
                    color: 'white', 
                    backgroundColor: '#4472c4', 
                    borderColor: '#4472c4'}}
                  type="submit"
                  onClick={this.submitSignUp}
                  >
                  완료
                </Button>
                </div>
            </SwipeableViews>
            
            
            
          </Row>
					<Row>
						<Col>
                
						</Col>
					</Row>
          <Row style={{padding: '20px 0 20px 0'}}>
            <Col>
              
            </Col>
            <Col>
              
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default withRouter(Signup);
