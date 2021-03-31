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
    axios.post('http://localhost:5000/api/test')
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
          height: '500px', 
          display: 'table', 
          }}>
        <Container>
          <Row className="justify-content-center align-items-center">
            <Col>
              <h2>
                {userName ? `Hello ${userName}` : 'No User Login'}
              </h2>
            </Col>
            <Col >
              <Button>
                로그인
              </Button>
            </Col>
          </Row>
          <Row className="justify-content-md-center">
            <Col>
              <Button>
                로그인
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Header;
