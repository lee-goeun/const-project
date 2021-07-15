import React from "react";
import axios from "axios";

import { withRouter, Link } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";

import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import CloseIcon from "@material-ui/icons/Close";
import CheckIcon from "@material-ui/icons/Check";

import IconButton from "@material-ui/core/IconButton";
import ClearIcon from "@material-ui/icons/Clear";

import { InputLabel, Checkbox, FormControl, Input } from "@material-ui/core";

import SwipeableViews from "react-swipeable-views";

import "./signup_page.css";

class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      email_check: false,
      name: "",
      name_check: false,
      password: "",
      password_check: false,
      password_confirmed: "",
      password_confirmed_check: false,

      agree_clause_essential: false,
      agree_collect_personalinfo_essential: false,
      agree_all: false,
      stepIndex: 0,
    };
  }

  goBackPage = () => {
    this.props.history.goBack();
  };
  goLoginPage = () => {
    this.props.history.push("/signin");
  };

  // Step1 => 이용약관 동의 handler
  handleAgreeClauseEssential = () => {
    this.setState({
      agree_clause_essential: !this.state.agree_clause_essential,
    });
  };
  handleAgreeCollectPersonalInfoEssential = () => {
    this.setState({
      agree_collect_personalinfo_essential:
        !this.state.agree_collect_personalinfo_essential,
    });
  };
  handleAgreeAll = () => {
    if (!this.state.agree_all) {
      this.setState({
        agree_all: true,
        agree_clause_essential: true,
        agree_collect_personalinfo_essential: true,
      });
    } else {
      this.setState({
        agree_all: false,
        agree_clause_essential: false,
        agree_collect_personalinfo_essential: false,
      });
    }
  };

  // Step2 => 이메일 입력 Handler
  handleEmail = (e) => {
    let email = e.target.value;
    if (!email) {
      this.setState({ email_check: false, email: "" });
      return;
    }

    // TODO: 이메일 형식 확인(Regular Expression)

    axios.post("/api/user/checkemail", { email }).then((res) => {
      if (!res.data.result) {
        // 사용가능한 이름
        this.setState({ email_check: true, email: email });
        return;
      }
      this.setState({ email_check: false, email: email });
    });
  };

  // Step3 => 이름 입력 Handler
  handleName = (e) => {
    let name = e.target.value;
    if (!name) {
      this.setState({ name_check: false, name: "" });
      return;
    }

    // TODO: 공백, 한글, 영어, 숫자 최대 20자 검증

    this.setState({ name_check: true, name: name });
  };

  // Step4 => 비밀번호 입력 Handler
  handlePassword = (e) => {
    let password = e.target.value;
    if (!password || password.length < 6) {
      this.setState({ password_check: false, password: password });
      return;
    }
    this.setState({ password_check: true, password: password });
  };

  // Step4-1 => 비밀번호 재입력 Handler
  handlePasswordConfirmed = (e) => {
    let password_confirmed = e.target.value;
    const prev_password = this.state.password;

    if (password_confirmed !== prev_password) {
      this.setState({
        password_confirmed_check: false,
        password_confirmed: password_confirmed,
      });
      return;
    }
    this.setState({
      password_confirmed_check: true,
      password_confirmed: password_confirmed,
    });
  };

  // Step4-2 => 회원가입 요청(비밀번호 재입력 이후 "계속하기" 버튼 클릭시 수행)
  submitSignUp = () => {
    const {
      email,
      name,
      password,
      agree_clause_essential,
      agree_collect_personalinfo_essential,
    } = this.state;

    let agree_section = {
      agree_clause_essential,
      agree_collect_personalinfo_essential,
    };

    const user_data = { email, name, password, agree_section };

    axios
      .post("/api/user/signup", user_data)
      .then((res) => {
        if (res.data.status === "success") {
          this.handleNextStep();
          console.log("success");
        }
      })
      .catch((error) => {
        console.log("Error: ", error);
        alert("오류가 발생하였습니다. 관리자에게 문의해 주세요");
      });
  };

  // Swipeable view Step Handler
  handleChangeStep = (stepIndex) => {
    this.setState({ stepIndex });
  };
  handleNextStep = () => {
    this.setState({ stepIndex: this.state.stepIndex + 1 });
  };
  handlePrevStep = () => {
    if (this.state.stepIndex > 0) {
      this.setState({ stepIndex: this.state.stepIndex - 1 });
      return;
    }
    this.props.history.goBack();
  };

  // Rendering
  render() {
    const {
      stepIndex, // 회원가입 Step 화면 view Index
      agree_clause_essential, // 이용약관(필수)
      agree_collect_personalinfo_essential, // 개인정보수집(필수)
      agree_all, // 약관 전체 동의
      email,
      email_check,
      name,
      name_check,
      password,
      password_check,
      password_confirmed,
      password_confirmed_check,
    } = this.state;

    let email_check_msg = email_check ? (
      <span className="success-msg">사용가능한 메일입니다.</span>
    ) : email ? (
      <span className="warning-msg">중복된 메일입니다.</span>
    ) : (
      <span style={{ fontSize: "12px" }}>&nbsp;</span>
    );

    let name_check_msg = name_check ? (
      <span className="success-msg">사용가능한 이름입니다.</span>
    ) : name ? (
      <span className="warning-msg">중복된 이름입니다.</span>
    ) : (
      <span style={{ fontSize: "12px" }}>&nbsp;</span>
    );

    let password_check_msg = <span style={{ fontSize: "12px" }}>&nbsp;</span>;
    if (password_check) {
      password_check_msg = (
        <span className="success-msg">사용가능한 비밀번호입니다.</span>
      );
    } else if (0 < password.length && password.length < 6) {
      password_check_msg = (
        <span className="warning-msg">6자리 이상 입력해 주세요</span>
      );
    }

    let password_confirmed_check_msg = password_confirmed_check ? (
      <span className="success-msg">사용가능한 비밀번호입니다.</span>
    ) : password_confirmed ? (
      <span className="warning-msg">비밀번호가 일치하지 않습니다.</span>
    ) : (
      <span style={{ fontSize: "12px" }}>&nbsp;</span>
    );

    let arrow_back_icon;
    const LAST_STEP = 5;
    if (stepIndex < LAST_STEP) {
      arrow_back_icon = <ArrowBackIosIcon onClick={this.handlePrevStep} />;
    }

    let next_button_box;
    switch (stepIndex) {
      case 0:
        next_button_box = (
          <Button
            className="next-button"
            style={{
              backgroundColor: agree_all ? "#615EFF" : "#BDBDBD",
              borderColor: agree_all ? "#615EFF" : "#BDBDBD",
            }}
            block
            disabled={!agree_all}
            onClick={this.handleNextStep}
          >
            동의하고 진행하기
          </Button>
        );
        break;
      case 1:
        next_button_box = (
          <Button
            className="next-button"
            style={{
              backgroundColor: email_check ? "#615EFF" : "#BDBDBD",
              borderColor: email_check ? "#615EFF" : "#BDBDBD",
            }}
            block
            disabled={!email_check}
            onClick={this.handleNextStep}
          >
            계속하기
          </Button>
        );
        break;
      case 2:
        next_button_box = (
          <Button
            className="next-button"
            style={{
              backgroundColor: name_check ? "#615EFF" : "#BDBDBD",
              borderColor: name_check ? "#615EFF" : "#BDBDBD",
            }}
            block
            disabled={!name_check}
            onClick={this.handleNextStep}
          >
            계속하기
          </Button>
        );
        break;
      case 3:
        next_button_box = (
          <Button
            className="next-button"
            style={{
              backgroundColor: password_check ? "#615EFF" : "#BDBDBD",
              borderColor: password_check ? "#615EFF" : "#BDBDBD",
            }}
            block
            disabled={!password_check}
            onClick={this.handleNextStep}
          >
            계속하기
          </Button>
        );
        break;
      case 4:
        next_button_box = (
          <Button
            className="next-button"
            style={{
              backgroundColor: password_confirmed_check ? "#615EFF" : "#BDBDBD",
              borderColor: password_confirmed_check ? "#615EFF" : "#BDBDBD",
            }}
            block
            disabled={!password_confirmed_check}
            onClick={this.submitSignUp}
          >
            계속하기
          </Button>
        );
        break;
      default:
        next_button_box = (
          <Link to="/signin">
            <Button
              className="next-button"
              style={{
                backgroundColor: "#615EFF",
                borderColor: "#615EFF",
              }}
            >
              로그인
            </Button>
          </Link>
        );
        break;
    }

    return (
      <Container style={{ padding: "0px" }}>
        <Row
          className="align-items-start"
          style={{ height: "120px", paddingTop: "30px" }}
        >
          <Col style={{ textAlign: "start" }}>{arrow_back_icon}</Col>
          <Col style={{ textAlign: "end" }}>
            <CloseIcon onClick={this.goBackPage} />
          </Col>
        </Row>
        <Row style={{ textAlign: "center", padding: "0 20px 0 20px" }}>
          <SwipeableViews
            index={stepIndex}
            onChangeIndex={this.handleChangeStep}
          >
            {/* Step1 => 이용약관 동의 화면 */}
            <div style={Object.assign({})}>
              <Row
                style={{
                  paddingTop: "20px",
                  textAlign: "left",
                  paddingBottom: "10px",
                }}
              >
                <Col>
                  <span
                    style={{
                      fontSize: "19px",
                      fontWeight: "bold",
                    }}
                  >
                    약관을 확인해 주세요
                  </span>
                </Col>
              </Row>
              <div
                style={{
                  paddingTop: "15px",
                  textAlign: "left",
                  height: "450px",
                }}
              >
                <Row className="align-items-center">
                  <Col xs="1" style={{ paddingLeft: "5px" }}>
                    <Checkbox
                      color="primary"
                      size="small"
                      onClick={this.handleAgreeAll}
                    />
                  </Col>
                  <Col>
                    <span>약관에 전체 동의합니다.</span>
                  </Col>
                </Row>
                <Row
                  className="align-items-center"
                  style={{
                    width: "100%",
                    height: "40px",
                    textAlign: "left",
                  }}
                >
                  <Col xs="1">
                    <CheckIcon
                      style={{
                        fontSize: "20px",
                        color: agree_clause_essential ? "#615EFF" : "#ccc",
                      }}
                    />
                  </Col>
                  <Col>
                    <span style={{ fontSize: "12px" }}>이용약관 (필수)</span>
                  </Col>
                  <Col xs="1">
                    <KeyboardArrowDownIcon />
                  </Col>
                </Row>
                <Row
                  className="align-items-center"
                  style={{
                    width: "100%",
                    height: "40px",
                    textAlign: "left",
                  }}
                >
                  <Col xs="1">
                    <CheckIcon
                      style={{
                        fontSize: "20px",
                        color: agree_collect_personalinfo_essential
                          ? "#615EFF"
                          : "#ccc",
                      }}
                    />
                  </Col>
                  <Col style={{ paddingRight: "0" }}>
                    <span style={{ fontSize: "12px" }}>
                      개인정보 및 필수 항목에 대한 처리 및 이용 (필수)
                    </span>
                  </Col>
                  <Col xs="1">
                    <KeyboardArrowDownIcon />
                  </Col>
                </Row>
              </div>
            </div>

            {/* Step2 => 이메일 입력 */}
            <div style={Object.assign({})}>
              <Row
                style={{
                  paddingTop: "20px",
                  textAlign: "left",
                  paddingBottom: "10px",
                }}
              >
                <Col>
                  <span
                    style={{
                      fontSize: "19px",
                      fontWeight: "bold",
                    }}
                  >
                    이메일을 입력해 주세요
                  </span>
                </Col>
              </Row>
              <Row
                style={{
                  textALign: "center",
                  paddingTop: "10px",
                }}
              >
                <Col>
                  <div className="input-box">
                    <FormControl fullWidth={true}>
                      <InputLabel style={{ padding: "5px 0 0 8px" }}>
                        이메일
                      </InputLabel>
                      <Input
                        disableUnderline={true}
                        placeholder="example@mail.com"
                        style={{ padding: "0 0 5px 8px" }}
                        onChange={this.handleEmail}
                      ></Input>
                      <IconButton
                        aria-label="visibilityIcon"
                        component="span"
                        style={{
                          position: "absolute",
                          right: "0px",
                          top: "10px",
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    </FormControl>
                  </div>
                </Col>
              </Row>
              <Row style={{ textAlign: "left" }}>
                <Col>{email_check_msg}</Col>
              </Row>
            </div>

            {/* TODO: Step2-1 => 이메일 인증 작업 */}

            {/* Step3 => 이름 입력 */}
            <div style={Object.assign({})}>
              <Row
                style={{
                  paddingTop: "20px",
                  textAlign: "left",
                  paddingBottom: "10px",
                }}
              >
                <Col>
                  <span
                    style={{
                      fontSize: "19px",
                      fontWeight: "bold",
                    }}
                  >
                    사용하실 이름을 입력해 주세요
                  </span>
                </Col>
              </Row>
              <Row
                style={{
                  textALign: "center",
                  paddingTop: "10px",
                }}
              >
                <Col>
                  <div className="input-box">
                    <FormControl fullWidth={true}>
                      <InputLabel style={{ padding: "5px 0 0 8px" }}>
                        이름
                      </InputLabel>
                      <Input
                        disableUnderline={true}
                        placeholder="춤추는올빼미"
                        style={{ padding: "0 0 5px 8px" }}
                        onChange={this.handleName}
                      ></Input>
                    </FormControl>
                  </div>
                </Col>
              </Row>
              <Row style={{ textAlign: "left" }}>
                <Col>{name_check_msg}</Col>
              </Row>
            </div>

            {/* Step4 => 비밀번호 입력 */}
            <div style={Object.assign({})}>
              <Row
                style={{
                  paddingTop: "20px",
                  textAlign: "left",
                  paddingBottom: "10px",
                }}
              >
                <Col>
                  <span
                    style={{
                      fontSize: "19px",
                      fontWeight: "bold",
                    }}
                  >
                    비밀번호를 설정해 주세요
                  </span>
                </Col>
              </Row>
              <Row
                style={{
                  textALign: "center",
                  paddingTop: "10px",
                }}
              >
                <Col>
                  <div className="input-box">
                    <FormControl fullWidth={true}>
                      <InputLabel style={{ padding: "5px 0 0 8px" }}>
                        비밀번호
                      </InputLabel>
                      <Input
                        disableUnderline={true}
                        type="password"
                        style={{ padding: "0 0 5px 8px" }}
                        onChange={this.handlePassword}
                      ></Input>
                    </FormControl>
                  </div>
                </Col>
              </Row>
              <Row style={{ textAlign: "left" }}>
                <Col>{password_check_msg}</Col>
              </Row>
            </div>

            {/* Step4-1, Step4-2 => 비밀번호 재입력 이후 회원가입 요청 */}
            <div style={Object.assign({})}>
              <Row
                style={{
                  paddingTop: "20px",
                  textAlign: "left",
                  paddingBottom: "10px",
                }}
              >
                <Col>
                  <span
                    style={{
                      fontSize: "19px",
                      fontWeight: "bold",
                    }}
                  >
                    비밀번호를 한번 더 입력해 주세요
                  </span>
                </Col>
              </Row>
              <Row
                style={{
                  textALign: "center",
                  paddingTop: "10px",
                }}
              >
                <Col>
                  <div className="input-box">
                    <FormControl fullWidth={true}>
                      <InputLabel style={{ padding: "5px 0 0 8px" }}>
                        비밀번호
                      </InputLabel>
                      <Input
                        disableUnderline={true}
                        type="password"
                        style={{ padding: "0 0 5px 8px" }}
                        onChange={this.handlePasswordConfirmed}
                      ></Input>
                    </FormControl>
                  </div>
                </Col>
              </Row>
              <Row style={{ textAlign: "left" }}>
                <Col>{password_confirmed_check_msg}</Col>
              </Row>
            </div>

            {/* Step5 => 회원가입 완료 */}
            <div style={Object.assign({})}>
              <Row
                style={{
                  paddingTop: "20px",
                  textAlign: "left",
                  paddingBottom: "10px",
                }}
              >
                <Col>
                  <span
                    style={{
                      fontSize: "19px",
                      fontWeight: "bold",
                    }}
                  >
                    회원가입 완료
                  </span>
                </Col>
              </Row>
              <div
                style={{
                  paddingTop: "15px",
                  textAlign: "left",
                  height: "450px",
                }}
              >
                <Row
                  className="align-items-center"
                  style={{
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  <Col>
                    <span style={{ fontSize: "13px" }}>
                      회원가입이 완료되었습니다.
                    </span>
                  </Col>
                </Row>
                <Row
                  className="align-items-center"
                  style={{
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  <Col style={{ paddingRight: "0" }}>
                    <span style={{ fontSize: "13px" }}>
                      이제 클링크를 이용하실 수 있습니다.
                    </span>
                  </Col>
                </Row>
              </div>
            </div>
          </SwipeableViews>
        </Row>
        <Row className="next-button-box">
          <Col>{next_button_box}</Col>
        </Row>
      </Container>
    );
  }
}

export default withRouter(Signup);
