import React from 'react'; 
import axios from 'axios'; 


import {Container, Row, Col, Button} from 'react-bootstrap'; 

class SignUp extends React.Component {

  constructor(props) { 
    super(props); 
    this.state = { 
      userName: "const User"
    }
  }
  componentDidMount() { 

		axios.get('/api/test')
		.then(res => { 
			this.setState({ 
				userName: res.data.userName
			})
		}); 
  }

  goBackPage = () => { 
		this.props.history.goBack(); 
  }

  render() { 
    const { userName } = this.state; 

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
              <p style={{fontSize: '35px', color: 'orange'}}>
                회원가입
              </p>
            </Col>
          </Row>
          <Row style={{textAlign: 'left', fontSize: '18px', height: '400px'}}>
            <Col>
                <form>
                    <Row style={{padding: '5px 0 5px 0'}}>
                        <Col>
                            <div className="form-group">
                                <label style={{paddingLeft: "10px"}}>성</label>
                                <input type="text" className="form-control" placeholder="성" />
                            </div>
                        </Col>
                        <Col>
                            <div className="form-group">
                                <label style={{paddingLeft: "10px"}}>이름</label>
                                <input type="text" className="form-control" placeholder="이름" />
                            </div>
                        </Col>
                    </Row>
                    <Row style={{padding: '5px 0 5px 0'}}>
                        <Col>
                            <div className="form-group">
                                <label style={{paddingLeft: "10px"}}>이메일 계정</label>
                                <input type="email" className="form-control" placeholder="abc@example.com" />
                            </div>
                        </Col>
                    </Row>
                    <Row style={{padding: '5px 0 5px 0'}}>
                        <Col>
                            <div className="form-group">
                                <label style={{paddingLeft: "10px"}}>비밀번호</label>
                                <input type="password" className="form-control" placeholder="비밀번호 입력" />
                            </div>
                        </Col>
                    </Row>
										<Row style={{padding: '5px 0 5px 0'}}>
                        <Col>
                            <div className="form-group">
                                <label style={{paddingLeft: "10px"}}>비밀번호 확인</label>
                                <input type="password" className="form-control" placeholder="비밀번호 확인" />
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
                  backgroundColor: 'orange', 
                  borderColor: 'orange'}}
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

export default SignUp;
