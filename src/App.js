import React from 'react';  
import { Container } from 'react-bootstrap';
import { Route, Switch } from 'react-router-dom'; 
import './App.css';

import { Provider } from 'react-redux'; 
import { applyMiddleware, createStore } from 'redux';
import promiseMiddleware from 'redux-promise'; 
import ReducThunk from 'redux-thunk'; 
import Reducer from './_reducers';

import MainPage from "views/MainPage/MainPage"; 
import SignupPage from "views/SignupPage/SignupPage"; 
import SigninPage from "views/SigninPage/SigninPage";  
import DashboardPage from "views/DashboardPage/DashboardPage"; 

import MyInfoPage from 'views/MyInfoPage/MyInfoPage';
import MyWalletPage from 'views/MyInfoPage/MyWalletPage'; 

import WalletAddMainPage from 'views/MyInfoPage/WalletAdd/WalletAddMainPage';
import WalletImportPage from 'views/MyInfoPage/WalletAdd/WalletImportPage';

import Auth from './hoc/auth'; 

const createStoreWithMiddleware = applyMiddleware(promiseMiddleware, ReducThunk)(createStore)
class App extends React.Component {

  constructor(props) { 
    super(props); 
  }

  render() {  
    return  ( 
      <Provider
        store={createStoreWithMiddleware(Reducer,
        window.__REDUX_DEVTOOLS_EXTENSION__ && 
        window.__REDUX_DEVTOOLS_EXTENSION__() 
        )} 
      >
        <div className="App justify-content-center" style={{padding: '0', margin: '0 auto'}} >
          <Container fluid='md'>
            <Switch>
              <Route exact path="/" component={Auth(MainPage, false)} /> 
              <Route path="/signup" component={Auth(SignupPage, false)} /> 
              <Route path="/signin" component={Auth(SigninPage, false)} /> 
              <Route path="/dashboard" component={Auth(DashboardPage, true)} /> 
              
              <Route exact path="/myinfo" component={Auth(MyInfoPage, true)} /> 
              <Route exact path="/myinfo/wallet" component={Auth(MyWalletPage, true)} /> 

              <Route exact path="/myinfo/wallet/new" component={Auth(WalletAddMainPage, true)} /> 
              <Route exact path="/myinfo/wallet/import" component={Auth(WalletImportPage, true)} /> 

            </Switch>
          </Container>
        </div>
      </Provider>
    );
  }
}

export default App;
