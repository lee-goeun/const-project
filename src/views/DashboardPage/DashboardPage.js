import React, {useState} from 'react'; 

import {Container, Row, Col, Button} from 'react-bootstrap'; 
import axios from 'axios'; 

import { useHistory } from 'react-router-dom'; 
import { useDispatch } from 'react-redux'; 
import { withRouter } from 'react-router';

import SwipeableViews from 'react-swipeable-views';
import PropTypes from 'prop-types'; 

import { auth } from '_actions/user_action'; 

import NavBar from 'components/NavBar';
import WalletInfo from './WalletInfo';
import LendingInfo from './LendingInfo'; 

import LineChart from 'components/charts/LineChart'; 
// import DoughnutChart from 'components/charts/DoughnutChart'; 

import { 
  FormControl, 
  Select, 
  MenuItem, 
  AppBar, 
  Tabs, 
  Tab, 
  Box, 
  Typography, 
  Divider
} from '@material-ui/core'; 

import logo_img from 'static/img/logo_img.png';
import './dashboard_page.css'; 



function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
    style: {fontSize: '12px',}
  };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={4} style={{width: '100%'}}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};




function DashboardPage(props) {

  const dispatch = useDispatch(); 
  const history = useHistory(); 

  const [userInfo, setUserInfo] = useState({});
  const [KlayBalance, setKlayBalance] = useState({}); 
  const [BSCBalance, setBSCBalance] = useState({}); 
  const [BSCLending, setBSCLending] = useState({}); 

  const [cardIndex, setCardIndex] = useState(1); 
  const [networkType, setNetworkType] = useState('All'); 

  const handleCardIndexChange = (_, newIndex) => { setCardIndex(newIndex) }; 
  const onNetworkTypeHandler = (_, newType) => { setNetworkType(newType) }; 

  React.useEffect(() => { 
    dispatch(auth()).then(res => { 
      if (res.payload) { 
        setUserInfo(res.payload); 
        axios.get(`/api/wallet/${res.payload._id}`)
          .then((res) => { 
            res.data.wallets.forEach(wallet => {
              const {address, atype} = wallet;
              if (atype == 'Klaytn') { 
                axios.post('/api/wallet/balance', {address, atype})
                  .then((res) => { 
                    setKlayBalance(res.data.result); 
                  })
                // setKlayWallet(wallet)
              } else if (atype == 'BSC') { 
                axios.post('/api/wallet/balance', {address, atype})
                  .then( (res) => { 
                    setBSCBalance(res.data.result); 
                  })
                axios.post('/api/wallet/lending', {address, atype})
                  .then( (res) => { 
                    setBSCLending(res.data.result); 
                  })
                }
            });
          })
      }
    })
  }, [])


  return ( 
    <Container style={{padding: '0'}}>
      <Row 
        className="align-items-end"
        style={{
          height:'100px'
      }}>
        <Col xs={4} style={{textAlign: 'left'}}>
          <img 
            src={logo_img} 
            style={{width: '100%'}}/> 
        </Col>
        <Col></Col>
        <Col xs={5} style={{
          textAlign: 'right', 
          color: 'white', 
        }}>
          <FormControl variant="outlined" fullWidth={true}>
            <Select
              onChange={onNetworkTypeHandler}
              value={networkType}
              style={{
                textAlign: 'left', 
                height: '40px', 
                backgroundColor: '#615EFF',
                borderColor: '#615EFF',  
                color: 'white', 
                marginBottom: '10px'
            }}>
              <MenuItem style={{}} value='All'>All</MenuItem>
              <MenuItem style={{}} value='Klaytn'>Klaytn</MenuItem>
              <MenuItem style={{}} value='Venus'>Venus</MenuItem>
            </Select>
          </FormControl>
        </Col>
      </Row>

      <Row 
        className='align-items-center'
        style={{
        textAlign: 'left', 
        margin: '0 auto', 
        height: '60px',
        position: 'absolute', 
        left: '0', 
        width: '100%'
      }}>
        <Col style={{padding: '0'}}>
          <AppBar position="static" color="white" elevation={0}> 
            <Tabs
              value={cardIndex}
              onChange={handleCardIndexChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="on"
            >
              <Tab label="전체" disabled {...a11yProps(0)} />
              <Tab label="지갑" {...a11yProps(1)} />
              <Tab label="랜딩" {...a11yProps(2)}  />
              <Tab label="파밍" disabled {...a11yProps(2)}  />
              <Tab label="예금" disabled {...a11yProps(2)}  />
            </Tabs>
          </AppBar>
          <Divider />
          <SwipeableViews
            // axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={cardIndex}
            onChangeIndex={handleCardIndexChange}
            style={{margin: '0px'}}
          >
            <TabPanel value={cardIndex} index={0}>
              전체
            </TabPanel>
            <TabPanel value={cardIndex} index={1}>
              <div style={{
                border: '1px solid #F2F2F2',  
                borderRadius: '5px', 
                marginBottom: '50px'
              }}>
                <div style={{
                  padding: '5px', 
                  fontSize: '14px', 
                }}>지갑 총액</div>
                <div style={{
                  padding: '5px', 
                  fontSize: '12px'
                }}>₩ 10,000,000</div>
                <LineChart /> 
              </div>
              <div style={{height: '400px'}}>
                { KlayBalance &&
                  <WalletInfo balance={KlayBalance} atype='Klaytn' /> }
                { BSCBalance && 
                  <WalletInfo balance={BSCBalance} atype='BSC' /> }
              </div>
            </TabPanel>
            <TabPanel value={cardIndex} index={2}>
              {BSCLending && 
                <LendingInfo lending={BSCLending} /> }
            </TabPanel>
            <TabPanel value={cardIndex} index={3}>파밍</TabPanel>
            <TabPanel value={cardIndex} index={4}>예금</TabPanel>
          </SwipeableViews>
        </Col>
      </Row>
      
      <NavBar dashboard={true} />
    </Container>
  )
}

export default withRouter(DashboardPage)