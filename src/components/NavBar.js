import React from 'react'; 
import axios from 'axios'; 


import {Container, Navbar, Nav, Button} from 'react-bootstrap'; 

class NavBar extends React.Component {

  constructor(props) { 
    super(props); 
    this.state = { 
			email: "", 
			password: "", 
    }
  }

  goBackPage = () => { 	
	  this.props.history.goBack(); 
  }
  
  render() { 

    return  ( 
      <div style={{
        width: '100%', 
        }}>
        <Navbar bg="primary" variant="dark">
          <Navbar.Brand href="#home">Navbar</Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#features">Features</Nav.Link>
            <Nav.Link href="#pricing">Pricing</Nav.Link>
          </Nav>
        </Navbar>
        <Container style={{padding: '20px'}}>
          
        </Container>
      </div>
    );
  }
}

export default NavBar;
