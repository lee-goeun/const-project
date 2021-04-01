import React from 'react'; 
import axios from 'axios'; 
import '../App.css';

import {Container, Row, Col, Button} from 'react-bootstrap'; 

class Header extends React.Component {

  constructor(props) { 
    super(props); 
    this.state = { 
      userName: "const User"
    }
  }
  componentDidMount() { 
    axios.post('/api/test')
    .then(res => { 
      this.setState({ 
        userName: res.data.userName
      })
    }); 
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
            className="justify-content-center align-items-end"
            style={{height:'500px', textAlign: 'left'}}>
            <Col>
              {/* <h2>
                {userName ? `Hello ${userName}` : 'No User Login'}
              </h2> */}
              <p className="text-justify" style={{fontSize: '35px'}}>
                당신 만을 위한 <br/> 내 손안의
              </p>
            </Col>
          </Row>
          <Row style={{textAlign: 'left', fontSize: '25px'}}>
            <Col>
              <p className="text-justify" style={{fontSize: '35px', color: 'orange'}}>
                자산관리사
              </p>
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
                >
                로그인
              </Button>
            </Col>
          </Row>
          <Row className="justify-content-md-center">
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

export default Header;
