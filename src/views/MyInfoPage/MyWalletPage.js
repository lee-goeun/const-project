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

import etu_token_img from 'static/img/token_icon/eth_token.png'; 
import klaytn_img from 'static/img/token_icon/klaytn_logo.png'; 
import bsc_img from 'static/img/token_icon/bsc_logo.png'; 
import venus_img from 'static/img/token_icon/venus_logo.png'; 


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


const ImportedBox = (
  <div>

    <span style={{
      borderRadius: '5px', 
      border: '1px solid #F2F2F2',
      width: '100%', 
      fontSize: '12px', 
      padding: '5px'
    }}>
      imported
    </span>

  </div>

  
);

function addressParsing(addr) { return addr.slice(0, 6) + '....' + addr.slice(-5) }


function MyWalletPage(props) {

  const dispatch = useDispatch(); 
  const history = useHistory(); 

  const [klaytnWallet, setKlaytnWallet] = useState(undefined); 
  const [BSCWallet, setBSCWallet] = useState(undefined); 
  const [cardIndex, setCardIndex] = useState(0); 

  React.useEffect(() => { 
    dispatch(auth()).then(res => { 
      if (res.payload) { 
        const { _id } = res.payload; 
        axios.get(`/api/wallet/${_id}`).then((res) => { 
          const {wallets} = res.data; 
          let klaytn_wallet = []; 
          let bsc_wallet = []; 

          wallets.forEach(wallet => {
            if (wallet.atype === 'Klaytn') klaytn_wallet.push(wallet) 
            else if (wallet.atype === 'BSC') bsc_wallet.push(wallet)
          });
          

          let klaytn_wallet_jsx = klaytn_wallet.map(wallet => { 
            return (
              <Row 
                key={wallet.address} 
                className='align-items-center'
                style={{
                  height: '30px'
                }}
              >
                <Col style={{fontSize: '13px', textDecoration: 'underline'}}>
                  {addressParsing(wallet.address)}
                </Col>
                <Col style={{textAlign: 'right', padding: '0 15px 5px 0'}}>
                  {/* {wallet.new ? 'new' : 'imported'} */}
                  {ImportedBox}
                </Col>
              </Row>
            );
          })
          setKlaytnWallet(klaytn_wallet_jsx);

          let bsc_wallet_jsx = bsc_wallet.map(wallet => { 
            return (
              <Row 
                key={wallet.address} 
                className='align-items-center'
                style={{
                  height: '30px'
                }}
              >
                <Col style={{fontSize: '13px', textDecoration: 'underline'}}>
                  {addressParsing(wallet.address)}
                </Col>
                <Col style={{textAlign: 'right', padding: '0 15px 5px 0'}}>
                  {/* {wallet.new ? 'new' : 'imported'} */}
                  {ImportedBox}
                </Col>
              </Row>
            );
          })
          setBSCWallet(bsc_wallet_jsx);
        })
      }
    })
  }, [])


  const handleCardIndexChange = (_, newIndex) => { setCardIndex(newIndex); };

  

  const klaytn_section = (
    <>
      <Row style={{height: '50px'}}>
        <Col xs={1}>
          <img src={klaytn_img} /> 
        </Col>
        <Col>
          <span style={{fontSize: '15px', fontWeight: 'bold'}}>
            Klaytn
          </span>
        </Col>
      </Row>
      {klaytnWallet}
      <Row style={{height: '20px'}}></Row>
    </>
  )

  const bsc_section = (
    <>
      <Row style={{height: '50px'}}>
        <Col xs={1}>
          <img src={bsc_img} /> 
        </Col>
        <Col>
          <span style={{fontSize: '15px', fontWeight: 'bold'}}>
            Binance Smart Chain
          </span>
        </Col>
      </Row>
      {BSCWallet}
      <Row style={{height: '20px'}}></Row>
    </>
  )



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
              <Tab label="Venus" {...a11yProps(2)}  />
              <Tab label="ETH" {...a11yProps(3)} disabled/>
              <Tab label="BSC" {...a11yProps(4)} disabled/>
              <Tab label="Polygon" {...a11yProps(5)} disabled />
              <Tab label="Terra" {...a11yProps(6)} disabled />
              <Tab label="Tron" {...a11yProps(7)} disabled />
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
              <div>
                <Row style={{height: '50px'}}>
                  <Col>
                    <span style={{
                      fontSize: '15px', 
                      fontWeight: 'bold' 
                    }}>등록된 지갑</span>
                  </Col>
                </Row>

                {klaytnWallet && klaytn_section}
                {klaytnWallet && <Divider />}
                {BSCWallet && <div style={{height: '20px'}}></div>}
                {BSCWallet && bsc_section}
              </div>
            </TabPanel>
            <TabPanel value={cardIndex} index={1}>
              {klaytnWallet && klaytn_section}
            </TabPanel>
            <TabPanel value={cardIndex} index={2}>
              {BSCWallet && bsc_section}
            </TabPanel>
            <TabPanel value={cardIndex} index={3}>ETH</TabPanel>
            <TabPanel value={cardIndex} index={4}>BSC</TabPanel>
            <TabPanel value={cardIndex} index={5}>POLYGON</TabPanel>
            <TabPanel value={cardIndex} index={6}>TERRA</TabPanel>
            <TabPanel value={cardIndex} index={7}>TRON</TabPanel>
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