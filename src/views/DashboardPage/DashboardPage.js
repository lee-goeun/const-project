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
import LineChart from 'components/charts/LineChart'; 
import DoughnutChart from 'components/charts/DoughnutChart'; 

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
  const [cardIndex, setCardIndex] = useState(0); 

  const handleCardIndexChange = (_, newIndex) => { setCardIndex(newIndex) }; 

  React.useEffect(() => { 
    dispatch(auth()).then(res => { 
      if (res.payload) { 
        setUserInfo(res.payload); 
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
              // onChange={onNetworkTypeHandler}
              // value={networkType}
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
              <Tab label="All chains" {...a11yProps(0)} />
              <Tab label="Klaytn" {...a11yProps(1)} />
              <Tab label="Venus" {...a11yProps(2)}  />
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
              <LineChart /> 
              <DoughnutChart />
            </TabPanel>
            <TabPanel value={cardIndex} index={1}>ETH</TabPanel>
            <TabPanel value={cardIndex} index={2}>BSC</TabPanel>
            <TabPanel value={cardIndex} index={3}>BSC2</TabPanel>
            <TabPanel value={cardIndex} index={4}>BSC3</TabPanel>
          </SwipeableViews>
        </Col>
      </Row>
      
      <NavBar dashboard={true} />
    </Container>
  )
}

export default withRouter(DashboardPage)