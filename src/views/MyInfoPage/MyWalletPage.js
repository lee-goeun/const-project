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

import { 
  AppBar, 
  Tabs,
  Tab, 
  Box, 
  Typography, 
  Divider 
} from '@material-ui/core'

import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';



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


function MyWalletPage(props) {

  const dispatch = useDispatch(); 
  const history = useHistory(); 

  const [userId, setUserId] = useState(''); 

  React.useEffect(() => { 
    dispatch(auth()).then(res => { 
      if (res.payload.hasOwnProperty('name')) { 
        const { _id } = res.payload; 
        setUserId(_id);
      }
    })
  }, [])


  const [cardIndex, setCardIndex] = useState(0); 
  const handleCardIndexChange = (_, newIndex) => { setCardIndex(newIndex); };

  return ( 
    <Container style={{padding: '0'}}>

      <Row 
        className="align-items-end"
        style={{
          height:'50px', 
          textAlign: 'left', 
          marginBottom: '20px'
      }}>
        <Col xs={1} style={{textAlign: 'left'}}>
          <ArrowBackIosIcon onClick={() => { history.goBack(); }} />
        </Col>
        <Col>
          <span style={{
            fontSize: '15px', 
            fontWeight: 'bold'
          }}>지갑 관리</span>
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
              <Tab label="Ethurieum" {...a11yProps(2)} />
              <Tab label="BSC" {...a11yProps(3)} />
              <Tab label="Polygon" {...a11yProps(4)} />
              <Tab label="Terra" {...a11yProps(5)} />
              <Tab label="Tron" {...a11yProps(6)} />
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
              <span style={{
                fontSize: '15px', 
                fontWeight: 'bold' 
              }}>등록된 지갑</span>
            </TabPanel>
            <TabPanel value={cardIndex} index={1}>Klaytn</TabPanel>
            <TabPanel value={cardIndex} index={2}>ETH</TabPanel>
            <TabPanel value={cardIndex} index={3}>BSC</TabPanel>
            <TabPanel value={cardIndex} index={4}>POLYGON</TabPanel>
            <TabPanel value={cardIndex} index={5}>TERRA</TabPanel>
            <TabPanel value={cardIndex} index={6}>TRON</TabPanel>
          </SwipeableViews>
        </Col>
      </Row>

      <Row style={{
        width: '100%', 
        maxWidth: '800px', 
        position: 'absolute', 
        left: '0', right: '0', 
        margin: '0 auto',
        bottom: '80px'
      }}>
        <Col>
          <Button
            className='next-button'
            style={{
              backgroundColor: '#615EFF', 
              borderColor: '#615EFF', 
            }}
            block
            onClick={() => { history.push('/myinfo/wallet/new') } }
          >지갑 추가</Button>
        </Col>
      </Row>

      <NavBar myinfo={true} />
    </Container>
  )
}

export default withRouter(MyWalletPage)