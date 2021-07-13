import React, { useState } from "react";

import { Container, Row, Col, Button } from "react-bootstrap";
import axios from "axios";

import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { withRouter } from "react-router";

import SwipeableViews from "react-swipeable-views";
import PropTypes from "prop-types";

import { auth } from "_actions/user_action";

import NavBar from "components/NavBar";
import WalletInfo from "./WalletInfo";
import FarmingInfo from "./FarmingInfo";

import LineChart from "components/charts/LineChart";
import DoughnutChart from "components/charts/DoughnutChart";
import { Doughnut } from "react-chartjs-2";

import bsc_img from "static/img/token_icon/bsc_logo.png";
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
} from "@material-ui/core";

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

function FarmingDetailInfo(props) {
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
    // DB에서 새로운 그래프 데이터 불러오기

    // state에 값저장
    setPeriodType(periodOpt);
  };

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
          <div className="container-border">
            <p style={{ fontSize: "0.8rem" }}>요약</p>
            <div className="farming-grid">
              <p style={{ flex: "1" }}>총 매수 금액</p>{" "}
              <p style={{ flex: "1", textAlign: "right" }}> ₩3,600,000</p>
            </div>
            <div className="farming-grid">
              <p style={{ flex: "1" }}>총 평가 금액</p>{" "}
              <p style={{ flex: "1", textAlign: "right" }}> ₩4,000,000</p>
            </div>
            <div className="farming-grid">
              <p style={{ flex: "1" }}>리워드 합계</p>{" "}
              <p style={{ flex: "1", textAlign: "right" }}> ₩400,000</p>
            </div>
            <div className="farming-grid">
              <p style={{ flex: "1" }}>수확된 리워드</p>{" "}
              <p style={{ flex: "1", textAlign: "right" }}> ₩600,000</p>
            </div>
            <div className="farming-grid">
              <p style={{ flex: "1" }}>예상 APR 평균</p>{" "}
              <p style={{ flex: "1", textAlign: "right" }}> 11.11%</p>
            </div>
            <div className="farming-grid">
              <p style={{ flex: "1" }}>현재 수익륜 평균</p>{" "}
              <p style={{ flex: "1", textAlign: "right" }}> 11.11%</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              block
              style={{
                color: "#FFFFFF",
                backgroundColor: "#95B1F9",
                border: "#E0E0E0",
                fontSize: "14px",
              }}
            >
              리워드 일괄 수확
            </Button>
          </div>

          <div className="container-border grid-row-offset">
            <p style={{ fontSize: "0.8rem" }}>풀</p>
            <div className="wallet-coin-item">
              <Row style={{ height: "40px" }}>
                <Col xs={1}>{<img src={bsc_img} />}</Col>
                <Col xs={7}>
                  {
                    <span style={{ fontSize: "15px", fontWeight: "bold" }}>
                      KSP + ETH
                    </span>
                  }
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
                    ▾ 89.30 %
                  </div>
                </Col>
                <Col>
                  <Button
                    variant="secondary"
                    size="sm"
                    style={{
                      backgroundColor: "#B5B4FF",
                      color: "#fff",
                    }}
                  >
                    리워드 수확
                  </Button>
                </Col>
              </Row>
              <div className="container-border" style={{ margin: "0" }}>
                <div className="farming-grid">
                  <p style={{ flex: "1" }}>예치 수량</p>{" "}
                  <p style={{ flex: "1", textAlign: "right" }}> 123.0000 KSP + 2.0000 ETH</p>
                </div>
                <div className="farming-grid">
                  <p style={{ flex: "1" }}>매수 금액</p>{" "}
                  <p style={{ flex: "1", textAlign: "right" }}> ₩900,000</p>
                </div>
                <div className="farming-grid"> 
                  <p style={{ flex: "1" }}>평가 금액</p>{" "}
                  <p style={{ flex: "1", textAlign: "right" }}> ₩1,000,000</p>
                </div>
                <div className="farming-grid">
                  <p style={{ flex: "1" }}>리워드</p>{" "}
                  <p style={{ flex: "1", textAlign: "right" }}> ₩1,000,000</p>
                </div>
                <div className="farming-grid">
                  <p style={{ flex: "1" }}>수확된 리워드</p>{" "}
                  <p style={{ flex: "1", textAlign: "right" }}> ₩1,000,000</p>
                </div>
                <div className="farming-grid">
                  <p style={{ flex: "1" }}>예상 APR</p>{" "}
                  <p style={{ flex: "1", textAlign: "right" }}> ₩1,000,000</p>
                </div>
                <div className="farming-grid">
                  <p style={{ flex: "1" }}>현재 수익률</p>{" "}
                  <p style={{ flex: "1", textAlign: "right" }}> ₩1,000,000</p>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default withRouter(FarmingDetailInfo);
