import React from 'react';  
import { Container } from 'react-bootstrap';
import { Route, Switch } from 'react-router-dom'; 
import './App.css';

import Main from "./components/Main"; 
import SignUp from "./components/user/SignUp"; 

class App extends React.Component {

  constructor(props) { 
    super(props); 
    this.state = { 
      userName: "Default"
    }
  }
  render() { 
    return  ( 
      <div className="App">
        <Container style={{maxWidth: '425px'}}>
          <Switch>
            <Route exact path="/" component={Main} /> 
            <Route path="/signup" component={SignUp} /> 
          </Switch>
        </Container>
      </div>
    );
  }
}

export default App;
