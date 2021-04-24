import React from 'react'; 
import axios from 'axios'; 

import { withRouter } from 'react-router-dom'; 
import {Container, Row, Col, Button} from 'react-bootstrap'; 
// import Form from 'react-bootstrap/Form'; 
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import CheckCircleOutlineRoundedIcon from '@material-ui/icons/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import Divider from '@material-ui/core/Divider';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Dialog from "@material-ui/core/Dialog"; 

import SwipeableViews from 'react-swipeable-views';

// export const Component = withRouter(({history, location}) => {})

class Signup extends React.Component {

  constructor(props) { 
    super(props); 
    this.state = { 
      name: "", 
			email: "", 
			password: "", 
			password_check: "", 
      agree_clause_essential: false, 
      agree_clause_optional: false, 
      agree_collect_personalinfo_essential: false, 
			agree_collect_personalinfo_optional: false, 
      agree_all: false, 
      stepIndex: 0, 
      warning_message: [], 
      open_modal: false, 
    }
  }

  handleName = e => { this.setState({ name: e.target.value}); };
	handleEmail = e => { this.setState({ email: e.target.value}); };
	handlePassword = e => { this.setState({ password: e.target.value}); };
	handlePasswordCheck = e => { this.setState({ password_check: e.target.value}); };

	handleAgreeClauseEssential = () => { this.setState({ agree_clause_essential: !this.state.agree_clause_essential}); };
  handleAgreeClauseOptional = () => { this.setState({ agree_clause_optional: !this.state.agree_clause_optional}); };
  handleAgreeCollectPersonalInfoEssential = () => { this.setState({ agree_collect_personalinfo_essential: !this.state.agree_collect_personalinfo_essential}); };
  handleAgreeCollectPersonalInfoOptional = () => { this.setState({ agree_collect_personalinfo_optional: !this.state.agree_collect_personalinfo_optional}); };

  handleAgreeAll = () => {
    if (!this.state.agree_all) {
      this.setState({
        agree_all: true, 
        agree_clause_essential: true, agree_clause_optional: true, 
        agree_collect_personalinfo_essential: true, agree_collect_personalinfo_optional: true, 
      }) } else { 
        this.setState({
          agree_all: false, 
          agree_clause_essential: false, agree_clause_optional: false, 
          agree_collect_personalinfo_essential: false, agree_collect_personalinfo_optional: false, 
        }) 
    }
  }

  handleChangeStep = stepIndex => { this.setState({stepIndex, }); }; 
  handleNextStep = () => { 

    if (!this.state.agree_clause_essential || !this.state.agree_collect_personalinfo_essential) { 
			alert("필수 약관 동의를 클릭해 주세요!")
			return; 
		}

    this.setState({stepIndex: this.state.stepIndex+1}); 
  }

  goBackPage = () => { 	this.props.history.goBack(); }; 
  goLoginPage = () => { 
    // this.setState({open_modal: false});
    this.props.history.push('/signin'); };
  
  validateSignupInfo = () => {
    
    let _messages = []; 
    if (!this.state.email || !this.state.password || !this.state.name) {
        _messages.push("모든 내용을 작성해 주세요."); 
    }

		if (this.state.password && 
      (this.state.password !== this.state.password_check)) { 
      _messages.push("비밀번호가 일치하지 않습니다."); 
		}

    // TODO--
    // 이메일 형식, 비밀번호 포멧 검사 필요
    // 이메일 및 닉네임 중복 검사 기능 구현 필요


    if (_messages.length) { 
      this.setState({warning_message: _messages});
      return; 
    }
    this.setState({stepIndex: this.state.stepIndex+1});
  }


  handleModal = (value) => { this.setState({open_modal: value})}; 

  submitSignUp = () => {

    const { 
      email, 
      name, 
      password, 
      agree_clause_essential,
      agree_clause_optional,
      agree_collect_personalinfo_essential,
      agree_collect_personalinfo_optional 
    } = this.state; 

    let agree_section = {
      agree_clause_essential, agree_clause_optional,
      agree_collect_personalinfo_essential, agree_collect_personalinfo_optional
    }; 

    const user_data = {email, name, password, agree_section}; 

    axios.post('/api/users/signup', user_data)
      .then(res => { 
        if (res.data.status === "success") { 
          this.setState({open_modal: true}); 
          // this.props.history.push("/signin"); 
        }
    }).catch(error => {
      console.log("Error: ", error); 
      alert("오류가 발생하였습니다. 관리자에게 문의해 주세요"); 
    })
  }


  render() { 

    const { 
      stepIndex,  // 회원가입 step 화면

      agree_clause_essential, // 이용약관(필수)
      agree_clause_optional,  // 개인정보수집(필수)
      agree_collect_personalinfo_essential, // 개인정보수집(선택)
      agree_collect_personalinfo_optional,  // 이용약관(선택)
      agree_all, 

      warning_message
    } = this.state; 

    let check_agree_clause_essential = agree_clause_essential ? 
      <CheckCircleRoundedIcon onClick={this.handleAgreeClauseEssential} style={{fontSize: 'large'}} /> : 
      <CheckCircleOutlineRoundedIcon onClick={this.handleAgreeClauseEssential} style={{fontSize: 'large'}} />;
    
    let check_agree_clause_optional = agree_clause_optional ? 
      <CheckCircleRoundedIcon onClick={this.handleAgreeClauseOptional} style={{fontSize: 'large'}} /> : 
      <CheckCircleOutlineRoundedIcon onClick={this.handleAgreeClauseOptional} style={{fontSize: 'large'}} />;

    let check_agree_collect_personalinfo_essential = agree_collect_personalinfo_essential ? 
      <CheckCircleRoundedIcon onClick={this.handleAgreeCollectPersonalInfoEssential} style={{fontSize: 'large'}} /> : 
      <CheckCircleOutlineRoundedIcon onClick={this.handleAgreeCollectPersonalInfoEssential} style={{fontSize: 'large'}} />;

    let check_agree_collect_personalinfo_optional = agree_collect_personalinfo_optional ? 
      <CheckCircleRoundedIcon onClick={this.handleAgreeCollectPersonalInfoOptional} style={{fontSize: 'large'}} /> : 
      <CheckCircleOutlineRoundedIcon onClick={this.handleAgreeCollectPersonalInfoOptional} style={{fontSize: 'large'}} />;

    let check_agree_all = agree_all ? 
      <CheckCircleRoundedIcon onClick={this.handleAgreeAll} style={{fontSize: 'large'}} /> : 
      <CheckCircleOutlineRoundedIcon onClick={this.handleAgreeAll} style={{fontSize: 'large'}} />;

    let messages = warning_message.map( (msg) => {
      return (
        <span style={{color: 'red'}}>{msg}<br/></span>
      )
    })

    return  ( 
      <div style={{
          width: '100%', 
           display: 'table', 
          }}>
        <Container>
          <Row 
            className="align-items-top"
            style={{height:'70px', textAlign: 'left', paddingTop: '10px'}}>
            <Col>
              <ArrowBackIosIcon onClick={this.goBackPage} />
              <span style={{fontSize: '20px'}}>
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
                      <span style={{ 
                        backgroundColor: stepIndex === 0 ? '#4472c4' : '#fff', 
                        width: '10px', height: '10px', 
                        borderStyle: 'solid', borderWidth: '1px', borderColor: '#b2b2b2', borderRadius: '50%', 
                        display: 'inline-block'}} />
                    </td>
                    <td style={{padding: '0 5px 0 5px'}}>
                      <span style={{ 
                        backgroundColor: stepIndex === 1 ? '#4472c4' : '#fff', 
                        width: '10px', height: '10px', 
                        borderStyle: 'solid', borderWidth: '1px', borderColor: '#b2b2b2', borderRadius: '50%', 
                        display: 'inline-block'}} />
                    </td>
                    <td style={{padding: '0 5px 0 5px'}}>
                      <span style={{ 
                        backgroundColor: stepIndex === 2 ? '#4472c4' : '#fff', 
                        width: '10px', height: '10px', 
                        borderStyle: 'solid', borderWidth: '1px', borderColor: '#b2b2b2', borderRadius: '50%', 
                        display: 'inline-block'}} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row>
          <Row style={{textAlign: 'center', fontSize: '14px', padding: '0 20px 0 20px'}}>
            <SwipeableViews index={stepIndex} onChangeIndex={this.handleChangeStep}>

              {/* Step1 => 이용약관 동의 화면 */}
              <div style={Object.assign({})}>
                <Row style={{paddingTop: '20px', textAlign: 'left', paddingBottom: '10px'}}>
                  <Col>
                    <span>약관 동의</span>
                  </Col>
                </Row>
                <Divider />
                <Row style={{paddingTop: '30px', textAlign: 'left'}}>
                  <Col xs="1">
                    {check_agree_clause_essential}
                  </Col>
                  <Col xs="6">
                    <span>이용약관(필수)</span>
                  </Col>
                  <Col xs="4" style={{textAlign: 'right', paddingRight: '20px'}}>
                    <a href="#">
                      <span>내용확인</span>
                    </a>
                  </Col>
                </Row>
                <Row style={{height: '100px', paddingTop: '30px', textAlign: 'left'}}>
                  <Col xs="1">
                    {check_agree_clause_optional}
                  </Col>
                  <Col xs="6">
                    <span>개인정보 및 필수 항목에 대한 처리 및 이용(필수)</span>
                  </Col>
                  <Col xs="4" style={{textAlign: 'right', paddingRight: '20px'}}>
                    <a href="#">
                      <span>내용확인</span>
                    </a>
                  </Col>
                </Row>
                <Divider />
                <Row style={{paddingTop: '30px', textAlign: 'left'}}>
                  <Col xs="1">
                    {check_agree_collect_personalinfo_essential}
                  </Col>
                  <Col xs="6">
                    <span>개인정보 선택 항목에 대한 처리 및 이용(선택)</span>
                  </Col>
                  <Col xs="4" style={{textAlign: 'right', paddingRight: '20px'}}>
                    <a href="#">
                      <span>내용확인</span>
                    </a>
                  </Col>
                </Row>
                <Row style={{padding: '30px 0 30px 0', textAlign: 'left'}}>
                  <Col xs="1">
                    {check_agree_collect_personalinfo_optional}
                  </Col>
                  <Col xs="6">
                    <span>이용약관(선택)</span>
                  </Col>
                  <Col xs="4" style={{textAlign: 'right', paddingRight: '20px'}}>
                    <a href="#">
                      <span>내용확인</span>
                    </a>
                  </Col>
                </Row>
                <Divider /> 
                <Row style={{height: '100px', paddingTop: '30px'}}>
                  <Col style={{paddingLeft: '0', textAlign: 'right'}}>
                    {check_agree_all}
                    <span style={{padding: '0 15px 0 5px'}}>약관 전체 동의</span>
                  </Col>
                </Row>
                <Row>
                  <Col>
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
                  </Col>
                </Row>
              </div>

              {/* Step2 => 아이디/비밀번호/닉네임 입력 */}
              <div style={Object.assign({})}>
                <Row style={{paddingTop: '20px', textAlign: 'left', paddingBottom: '10px'}}>
                  <Col>
                    <span>회원 정보</span>
                  </Col>
                </Row>
                <Divider />
                <Row style={{textAlign: 'left', paddingTop: '15px'}}>
                  <Col>
                    <form>
                      <Row>
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
                      <Row>
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
                      <Row>
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
                      <Row>
                        <Col>
                          <div className="form-group">
                            <label>사용자 닉네임</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="닉네임 입력"  
                              value={this.state.name}
                              onChange={this.handleName}
                            />
                          </div>
                        </Col>
                      </Row>
                    </form>
                  </Col>
                </Row>
                <Row style={{height: '50px', textAlign: 'left'}}>
                  <Col>
                    {messages}
                  </Col>
                </Row>
                <Button 
                  style={{
                    width: '100%', 
                    color: 'white', 
                    backgroundColor: '#4472c4', 
                    borderColor: '#4472c4'}}
                  type="submit"
                  onClick={this.validateSignupInfo}
                  >
                  회원가입 
                </Button>
              </div>

              {/* Step3 => 문자열 조합 발급(비밀번호 재설정 용) 확인 화면 */}
              <div style={Object.assign({})}>
                <Row style={{height: '100px', paddingTop: '20px', textAlign: 'left'}}>
                  <Col>
                    <span >문자열 조합 발급 </span>
                    <Divider />
                  </Col>
                </Row>
                <Row style={{height: '400px', padding: '5px 5px 0 5px'}}>
                  <Col>
                    <Card variant="outlined">
                      <CardContent>
                        <p>apple banana cherry</p>
                        <p>demmit esole fucking</p>
                      </CardContent>
                    </Card>
                  </Col>
                </Row>
                
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
                <Dialog
                  open={this.state.open_modal}
                  keepMounted
                  onClose={this.goLoginPage}
                >
                  {/* <DialogContent
                    id="classic-modal-slide-description"
                  > */}
                  {/* </DialogContent> */}
                  <Container style={{padding: '0 0 0 0'}}>
                    <Row style={{height: '150px', padding: '50px 15px 0 15px', textAlign: 'center'}}>
                      <Col>
                        <p>회원가입 완료!</p>
                        <p>해쉬브라운에 오신 것 환영합니다.</p>
                      </Col>
                    </Row>
                    <Row style={{width: '100%', padding: '0 0 0 0', margin: '0 0 0 0'}}>
                      <Col style={{padding: '0 0 0 0'}}>
                        <Button
                          onClick={this.goLoginPage}
                          style={{width: '100%', borderTopLeftRadius: '0px', borderTopRightRadius: '0px', borderColor: '#b2b2b2', backgroundColor: 'white', color: 'black'}}
                          >
                          로그인
                        </Button>
                      </Col>
                    </Row>
                  </Container>
                </Dialog>
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
