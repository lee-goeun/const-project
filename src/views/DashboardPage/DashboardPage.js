import React, { useState } from "react";

import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import axios from "axios";

import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { withRouter } from "react-router";

import SwipeableViews from "react-swipeable-views";
import PropTypes from "prop-types";

import { auth } from "_actions/user_action";

import NavBar from "components/NavBar";
import WalletInfo from "./WalletInfo";
import LendingInfo from "./LendingInfo";
import FarmingInfo from "./FarmingInfo";

import LineChart from "components/charts/LineChart";
import DoughnutChart from "components/charts/DoughnutChart";
import { Doughnut } from "react-chartjs-2";

import {
  FormControl,
  Select,
  MenuItem,
  AppBar,
  Tabs,
  Tab,
  Box,
  Typography,
  Divider,
  IconButton
} from "@material-ui/core";
import Menu from '@material-ui/icons/Menu';


import logo_img from "static/img/logo_img.png";
import "./dashboard_page.css";

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`,
    style: { fontSize: "12px" },
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
        <Box p={4} style={{ width: "100%" }}>
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

const periodOptions = [
  { type: "1D" },
  { type: "1W" },
  { type: "1M" },
  { type: "3M" },
];

function DashboardPage(props) {
  const dispatch = useDispatch();
  const history = useHistory();

  const [userInfo, setUserInfo] = useState({});
  const [KlayBalance, setKlayBalance] = useState({});
  const [BSCBalance, setBSCBalance] = useState({});
  const [BSCLending, setBSCLending] = useState({});

  const [cardIndex, setCardIndex] = useState(1);
  const [networkType, setNetworkType] = useState("All");

  const [periodType, setPeriodType] = useState("1D");

  const handleCardIndexChange = (_, newIndex) => {
    setCardIndex(newIndex);
  };
  const onNetworkTypeHandler = (_, newType) => {
    setNetworkType(newType);
  };

  const getAssetGraphValue = (periodOpt) => {
    // DB?????? ????????? ????????? ????????? ????????????

    // state??? ?????????
    setPeriodType(periodOpt);
  };

  /* ???????????? : info???????????? */
  function AlertInfo() {
    const [show, setShow] = useState(false);
    if (show) {
      return (
        <Alert
          onClose={() => setShow(false)}
          dismissible
          style={{
            backgroundColor: "#F6F6F6",
            position: "absolute",
            left: "50%",
            transform: "translate(-50%)",
            width: "300px",
          }}
        >
          <Alert.Heading style={{ fontSize: "14px" }}>?????????</Alert.Heading>
          <p style={{ fontSize: "12px" }}>
            ????????? ???????????? ?????? ?????? ????????? ????????? ?????? ?????? ????????? ????????? ??????
            ?????? ???????????????.
          </p>
        </Alert>
      );
    }
    return (
      <Button
        onClick={() => setShow(true)}
        variant="outline-dark"
        style={{
          width: "18px",
          height: "18px",
          padding: "0",
          fontSize: "11px",
          margin: "auto",
          marginLeft: "5px",
          borderRadius: "18px",
        }}
      >
        i
      </Button>
    );
  }

  React.useEffect(() => {
    dispatch(auth()).then((res) => {
      if (res.payload) {
        setUserInfo(res.payload);
        axios.get(`/api/wallet/${res.payload._id}`).then((res) => {
          res.data.wallets.forEach((wallet) => {
            const { address, atype } = wallet;
            if (atype == "Klaytn") {
              axios
                .post("/api/wallet/balance", { address, atype })
                .then((res) => {
                  setKlayBalance(res.data.result);
                });
              // setKlayWallet(wallet)
            } else if (atype == "BSC") {
              axios
                .post("/api/wallet/balance", { address, atype })
                .then((res) => {
                  setBSCBalance(res.data.result);
                });
              axios
                .post("/api/wallet/lending", { address, atype })
                .then((res) => {
                  setBSCLending(res.data.result);
                });
            }
          });
        });
      }
    });
  }, []);

  return (
    <Container style={{ padding: "0" }}>
      <Row
        className="align-items-end"
        style={{
          height: "90px",
          paddingBottom: '10px'
        }}
      >
        <Col xs={4} style={{ textAlign: "left" }}>
          <img src={logo_img} style={{ width: "100%" }} />
        </Col>
        <Col style={{ textAlign: "right" }}>
          <IconButton color="black" component="span" size="large" >
            <Menu style={{fontSize: '120%'}} />
          </IconButton>
        </Col>
        {/* <Col
          xs={5}
          style={{
            textAlign: "right",
            color: "white",
          }}
        >
          <FormControl variant="outlined" fullWidth={true}>
            <Select
              onChange={onNetworkTypeHandler}
              value={networkType}
              style={{
                textAlign: "left",
                height: "40px",
                backgroundColor: "#615EFF",
                borderColor: "#615EFF",
                color: "white",
                marginBottom: "10px",
              }}
            >
              <MenuItem style={{}} value="All">
                All
              </MenuItem>
              <MenuItem style={{}} value="Klaytn">
                Klaytn
              </MenuItem>
              <MenuItem style={{}} value="Venus">
                Venus
              </MenuItem>
            </Select>
          </FormControl>
        </Col> */}
      </Row>

      <Row
        className="align-items-center"
        style={{
          textAlign: "left",
          margin: "0 auto",
          height: "60px",
          // position: 'absolute',
          left: "0",
          width: "100%",
        }}
      >
        <Col style={{ padding: "0" }}>
          <AppBar position="static" color="white" elevation={0}>
            <Tabs
              value={cardIndex}
              onChange={handleCardIndexChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              scrollButtons="on"
            >
              <Tab label="??????" {...a11yProps(0)} />
              <Tab label="??????" {...a11yProps(1)} />
              <Tab label="??????" {...a11yProps(2)} />
              <Tab label="????????????" disabled {...a11yProps(2)} />
            </Tabs>
          </AppBar>
          <Divider />
          <SwipeableViews
            // axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={cardIndex}
            onChangeIndex={handleCardIndexChange}
            style={{ margin: "0px" }}
          >
            {/* ?????? */}
            <TabPanel value={cardIndex} index={0}>
              {/* <div style={{height: '1080px'}}>
                ??????
              </div> */}
              <div
                className="container-border"
                style={{ marginBottom: "20px" }}
              >
                <div
                  style={{
                    height: "2rem",
                    display: "flex",
                    flexDirection: "row",
                    // padding: '5px',
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      // padding: '5px',
                      fontSize: "14px",
                      flex: "1",
                    }}
                  >
                    <FormControl>
                      <Select
                        // onChange={onNetworkTypeHandler}
                        value={"netWorth"}
                        style={{
                          textAlign: "left",
                          // height: '40px',
                          backgroundColor: "",
                          borderColor: "none",
                          border: "none",
                          color: "#4F4F4F",
                          // marginBottom: '10px'
                          padding: "0",
                        }}
                      >
                        <MenuItem style={{}} value="netWorth">
                          ??? ??????
                        </MenuItem>
                        <MenuItem style={{}} value="totalAssets">
                          ??? ??????
                        </MenuItem>
                        <MenuItem style={{}} value="totalDebts">
                          ??? ??????
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                  <ul
                    style={{
                      flex: "1",
                      display: "flex",
                      flexDirection: "row",
                      listStyleType: "none",
                      fontSize: "0.7em",
                      justifyContent: "space-around",
                    }}
                  >
                    {periodOptions.map((opt, index) => {
                      return (
                        <li
                          className={
                            opt.type === periodType
                              ? "selected-period"
                              : "default-period"
                          }
                          key={`periodOpt${index}`}
                          onClick={() => getAssetGraphValue(opt.type)}
                        >
                          {opt.type}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div
                  style={{
                    padding: "5px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "18px",
                      display: "inline",
                    }}
                  >
                    ??? 31,000,000
                  </div>
                  {/* ????????? */}
                  <div
                    style={{
                      margin: "0 0 0 10px",
                      padding: "1px 3px",
                      fontSize: "12px",
                      display: "inline",
                      color: "#615EFF",
                      border: "0.5px solid #615EFF",
                      borderRadius: "5px",
                    }}
                  >
                    ??? 3.2 %
                  </div>
                </div>
                <LineChart />
              </div>

              <div
                className="container-border"
                style={{ marginBottom: "20px" }}
              >
                <p
                  style={{
                    color: "#828282",
                    fontSize: "12px",
                    marginBottom: "0",
                  }}
                >
                  ??? ??????
                </p>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <p style={{ flex: "1", marginTop: "5px" }}>??? 31,000,000</p>
                  <p
                    className="rise"
                    style={{
                      flex: "1",
                      textAlign: "right",
                      fontSize: "12px",
                      alignSelf: "center",
                      fontWeight: "lighter",
                      marginTop: "5px",
                    }}
                  >
                    + ??? 30,000
                  </p>
                </div>
                {/* </div>
              <div className='container-border' style={{ marginBottom: '20px'}}> */}
                <p
                  style={{
                    color: "#828282",
                    fontSize: "12px",
                    marginBottom: "0",
                  }}
                >
                  ??? ??????
                </p>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <p style={{ flex: "1", marginTop: "5px" }}>??? 34,000,000</p>
                  <p
                    className="rise"
                    style={{
                      flex: "1",
                      textAlign: "right",
                      fontSize: "12px",
                      alignSelf: "center",
                      fontWeight: "lighter",
                      marginTop: "5px",
                    }}
                  >
                    + ??? 30,000
                  </p>
                </div>
                {/* </div>
              <div className='container-border' style={{ marginBottom: '20px'}}> */}
                <p
                  style={{
                    color: "#828282",
                    fontSize: "12px",
                    marginBottom: "0",
                  }}
                >
                  ??? ??????
                </p>
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <p style={{ flex: "1", marginTop: "5px" }}>??? 3,000,000</p>
                  <p
                    className="drop"
                    style={{
                      flex: "1",
                      textAlign: "right",
                      fontSize: "12px",
                      alignSelf: "center",
                      fontWeight: "lighter",
                      marginTop: "5px",
                    }}
                  >
                    - ??? 30,000
                  </p>
                </div>
              </div>
            </TabPanel>

            {/* ?????? */}
            <TabPanel value={cardIndex} index={1}>
              <div className="container-border">
                <div
                  style={{
                    height: "2rem",
                    display: "flex",
                    flexDirection: "row",
                    // padding: '5px',
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      // padding: '5px',
                      fontSize: "14px",
                      flex: "1",
                    }}
                  >
                    ?????? ??????
                  </div>
                  {/* <ul style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'row',
                    listStyleType: 'none',
                    fontSize: '0.7em',
                    justifyContent: 'space-around'
                  }}>
                    { periodOptions.map((opt, index) => {
                      return <li 
                        className={opt.type === periodType ? 'selected-period' : 'default-period'} 
                        key={`periodOpt${index}`} 
                        onClick={() => getAssetGraphValue(opt.type)}
                        >{opt.type}</li>
                    }) }
                  </ul> */}
                </div>
                <div
                  style={{
                    padding: "5px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "18px",
                      display: "inline",
                    }}
                  >
                    ??? 10,000,000
                  </div>
                  {/* ????????? */}
                  <div
                    style={{
                      margin: "0 0 0 10px",
                      padding: "1px 3px",
                      fontSize: "12px",
                      display: "inline",
                      color: "#E64743",
                      border: "0.5px solid #E64743",
                      borderRadius: "5px",
                    }}
                  >
                    ??? 100.00 %
                  </div>
                </div>
                <LineChart />
              </div>

              <div className="container-border">
                {/* TODO: fontSize ?????????.... */}
                <p style={{ fontSize: "0.8rem" }}>?????? ?????? ??????</p>
                <DoughnutChart />
              </div>

              {/* <div className='???allet-grid-container container-border'>
                <div className='wallet-grid'>
                  <p style={{ flex: '1'}}>??? ??????</p> <p style={{ flex: '1', textAlign: 'right'}}> ???10,000,000</p>
                </div>
                <div className='wallet-grid'>
                  <p style={{ flex: '1'}}>??? ??????</p> <p style={{ flex: '1', textAlign: 'right'}}> ???5,000,000</p>
                </div>
                <div className='wallet-grid'>
                  <p style={{ flex: '1'}}>?????? ??????</p> <p style={{ flex: '1', textAlign: 'right'}}> ???5,000,000</p>
                </div>
                <div className='wallet-grid'>
                  <p style={{ flex: '1'}}>?????????</p> <p className="rise" style={{ flex: '1', textAlign: 'right'}}> ??? 300.00 %</p>
                </div>
              </div> */}

              <div className="container-border grid-row-offset">
                {KlayBalance && (
                  <WalletInfo balance={KlayBalance} atype="Klaytn" />
                )}
                {BSCBalance && <WalletInfo balance={BSCBalance} atype="BSC" />}
              </div>
            </TabPanel>
            {/* <TabPanel value={cardIndex} index={2}>
              {BSCLending && 
                <LendingInfo lending={BSCLending} marginBottom='50px' /> }
            </TabPanel> */}
            {/* ?????? */}
            <TabPanel value={cardIndex} index={2}>
              <div className="container-border">
                <div
                  style={{
                    height: "2rem",
                    display: "flex",
                    flexDirection: "row",
                    // padding: '5px',
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      // padding: '5px',
                      fontSize: "14px",
                      flex: "1",
                    }}
                  >
                    ??? ?????? ??????
                  </div>
                  {/* <ul style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'row',
                    listStyleType: 'none',
                    fontSize: '0.7em',
                    justifyContent: 'space-around'
                  }}>
                    { periodOptions.map((opt, index) => {
                      return <li 
                        className={opt.type === periodType ? 'selected-period' : 'default-period'} 
                        key={`periodOpt${index}`} 
                        onClick={() => getAssetGraphValue(opt.type)}
                        >{opt.type}</li>
                    }) }
                  </ul> */}
                </div>
                <div
                  style={{
                    padding: "5px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "18px",
                      display: "inline",
                    }}
                  >
                    ??? 10,000,000
                  </div>
                  {/* ????????? */}
                  <div
                    style={{
                      margin: "0 0 0 10px",
                      padding: "1px 3px",
                      fontSize: "12px",
                      display: "inline",
                      color: "#E64743",
                      border: "0.5px solid #E64743",
                      borderRadius: "5px",
                    }}
                  >
                    ??? 100.00 %
                  </div>
                </div>
                <LineChart />
              </div>

              <div className="container-border">
                <p style={{ fontSize: "0.8rem" }}>?????? ??????</p>
                <div className="farming-grid">
                  <p>??? ?????? ??????</p> <AlertInfo />
                  <p style={{ flex: "1", textAlign: "right" }}> ???3,600,000</p>
                </div>
                <div className="farming-grid">
                  <p>??? ?????? ??????</p> <AlertInfo />
                  <p style={{ flex: "1", textAlign: "right" }}> ???4,000,000</p>
                </div>
                <div className="farming-grid">
                  <p>????????? ??????</p> <AlertInfo />
                  <p style={{ flex: "1", textAlign: "right" }}> ???400,000</p>
                </div>
                <div className="farming-grid">
                  <p>????????? ?????????</p> <AlertInfo />
                  <p style={{ flex: "1", textAlign: "right" }}> ???600,000</p>
                </div>
                <div className="farming-grid">
                  <p>?????? APR ??????</p> <AlertInfo />
                  <p style={{ flex: "1", textAlign: "right" }}> 11.11%</p>
                </div>
                <div className="farming-grid">
                  <p>?????? ????????? ??????</p> <AlertInfo />
                  <p style={{ flex: "1", textAlign: "right" }}> 11.11%</p>
                </div>
              </div>

              <div className="container-border">
                <p style={{ fontSize: "0.8rem" }}>??????????????? ??????</p>
                {KlayBalance && (
                  <FarmingInfo balance={KlayBalance} atype="Klaytn" />
                )}
                {BSCBalance && <FarmingInfo balance={BSCBalance} atype="BSC" />}
              </div>
            </TabPanel>
            <TabPanel value={cardIndex} index={3}>
              ??????
            </TabPanel>
            <TabPanel value={cardIndex} index={4}>
              ??????
            </TabPanel>
          </SwipeableViews>
        </Col>
      </Row>

      <NavBar dashboard={true} />
    </Container>
  );
}

export default withRouter(DashboardPage);
