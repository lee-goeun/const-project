import React, { useState } from "react";

import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";

import bsc_img from "static/img/token_icon/bsc_logo.png";

function FarmingDetailInfo(props) {
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
          <Alert.Heading style={{ fontSize: "14px" }}>도움말</Alert.Heading>
          <p style={{ fontSize: "12px" }}>
            ‘매수 금액’은 풀에 처음 유동성 공급을 했을 당시 예치한 토큰의 원화
            환산 금액입니다.
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

  return (
    <Container style={{ padding: "0" }}>
      <Row
        className="align-items-end"
        style={{
          padding: "20px 0",
          position: "relative",
        }}
      >
        <Link to="./dashboard">
          <Button
            variant="outline-dark"
            style={{
              position: "absolute",
              left: "30px",
              top: "14px",
              border: "none",
            }}
          >
            &lt;
          </Button>
        </Link>
        <Col>
          {<img src={bsc_img} />}
          <span style={{ fontWeight: "700", paddingLeft: "5px" }}>
            KLAY SWAP
          </span>
        </Col>
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
          <div className="container-border">
            <p style={{ fontSize: "0.8rem" }}>요약</p>
            <div className="farming-grid">
              <p>총 매수 금액</p> <AlertInfo />
              <p style={{ flex: "1", textAlign: "right" }}> ₩3,600,000</p>
            </div>
            <div className="farming-grid">
              <p>총 평가 금액</p> <AlertInfo />
              <p style={{ flex: "1", textAlign: "right" }}> ₩4,000,000</p>
            </div>
            <div className="farming-grid">
              <p>리워드 합계</p> <AlertInfo />
              <p style={{ flex: "1", textAlign: "right" }}> ₩400,000</p>
            </div>
            <div className="farming-grid">
              <p>수확된 리워드</p> <AlertInfo />
              <p style={{ flex: "1", textAlign: "right" }}> ₩600,000</p>
            </div>
            <div className="farming-grid">
              <p>예상 APR 평균</p> <AlertInfo />
              <p style={{ flex: "1", textAlign: "right" }}> 11.11%</p>
            </div>
            <div className="farming-grid">
              <p>현재 수익륜 평균</p> <AlertInfo />
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
              <div className="container-border" style={{ margin: "0" }}>
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
                        borderStyle: "none",
                        borderRadius: "10px",
                        float: "right",
                      }}
                    >
                      리워드 수확
                    </Button>
                  </Col>
                </Row>

                <div className="farming-grid">
                  <p style={{ flex: "1" }}>예치 수량</p>{" "}
                  <p style={{ textAlign: "right" }}>
                    {" "}
                    123.0000 KSP + 2.0000 ETH
                  </p>
                </div>
                <div className="farming-grid">
                  <p style={{ flex: "1" }}>매수 금액</p>{" "}
                  <p style={{ textAlign: "right" }}> ₩900,000</p>
                </div>
                <div className="farming-grid">
                  <p style={{ flex: "1" }}>평가 금액</p>{" "}
                  <p style={{ textAlign: "right" }}> ₩1,000,000</p>
                </div>
                <div className="farming-grid">
                  <p style={{ flex: "1" }}>리워드</p>{" "}
                  <p style={{ textAlign: "right" }}> 1.0000 KSP (₩100,000)</p>
                </div>
                <div className="farming-grid">
                  <p style={{ flex: "1" }}>수확된 리워드</p>{" "}
                  <p style={{ textAlign: "right" }}> 0.5600 KSP (₩5,037)</p>
                </div>
                <div className="farming-grid">
                  <p style={{ flex: "1" }}>예상 APR</p>{" "}
                  <p style={{ textAlign: "right" }}> 77.11%</p>
                </div>
                <div className="farming-grid">
                  <p style={{ flex: "1" }}>현재 수익률</p>{" "}
                  <p style={{ textAlign: "right" }}> 77.11%</p>
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
