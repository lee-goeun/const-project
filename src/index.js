import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'; 
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles'; 

const theme = createMuiTheme({
  typography: { 
    fontFamily: 'Roboto Medium', 
  }, 
}); 

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <MuiThemeProvider
        theme={theme}>
        <App />
      </MuiThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
