import React from 'react';  
import { Route, Switch } from 'react-router-dom'; 
import './App.css';

import Login from "./components/Login"; 



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
        <Switch>
          <Route exact path="/" component={Login} /> 
        </Switch>
      </div>
    );
  }
}

export default App;
