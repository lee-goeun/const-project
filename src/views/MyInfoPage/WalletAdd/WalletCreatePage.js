import React, { useState, useEffect } from 'react';

import { useHistory } from 'react-router-dom'; 
import { useDispatch } from 'react-redux'; 

import axios from 'axios'; 
import { auth } from '_actions/user_action';
import { withRouter } from 'react-router'; 

import {Container, Row, Col, Button} from 'react-bootstrap'; 
import NavBar from 'components/NavBar';
import { 
	FormControl, 
	InputLabel,
	Select, 
	Input,
	MenuItem
} from '@material-ui/core'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

function WalletCreatePage(props) {

  const dispatch = useDispatch(); 
  const history = useHistory(); 


  const [userId, setUserId] = useState(''); 
  const [networkType, setNetworkType] = useState(''); 
	const [walletName, setWalletName] = useState(''); 

	const [statusMessage, setStatusMessage] = useState(setFormStatusMessage(''));
	const [check, setCheck] = useState(false); 

	
	function setFormStatusMessage(msg, status=true) { 
		if (!msg) { return (<span style={{fontSize: '12px'}}>&nbsp;</span>)};
    return (
			<span
			style={{
				fontSize: '12px',
				color: status ? '#615EFF' : '#F63131'
      }}>
        {msg}
      </span>
    )
  }

	const onNetworkTypeHandler = (e) => {	setNetworkType(e.target.value);	};

	// 네트워크 및 별명 설정할 때 버튼 활성화 여부 체크
	useEffect(() => {
		setCheck(walletName && networkType);
	}, [networkType, walletName]);

	const checkWalletName = (e) => {
		const walletName = e.target.value;
		// TODO: 유효성 검사

		setWalletName(walletName); 
    if (walletName) { 
      setStatusMessage(setFormStatusMessage('사용가능한 별명입니다.')); 
      if (walletName) { setCheck(true) }
    } else { 
      setStatusMessage(setFormStatusMessage('이미 사용중인 별명입니다.'));
		}
	};

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
						fontWeight: 'bold',
						textAlign: 'center'
          }}>새 지갑 주소 생성</span>
        </Col>
      </Row>
      <Row style={{marginTop: '30px'}}>
        <Col>
          <p style={{
            fontSize: '12px', 
            fontWeight: 'bold', 
						textAlign: 'left',
						whiteSpace: 'pre-wrap'
          }}>{'네트워크를 선택한 후 생성 버튼을 선택하세요.\n회원님의 clink 지갑 주소가 생성됩니다.'}</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <FormControl variant="outlined" fullWidth={true}>
            <InputLabel htmlFor="network-select-label">네트워크 선택</InputLabel>
            <Select
              label="네트워크 선택"
              labelId="network-select-label"
              id="network-select"
              style={{textAlign: 'left'}}
              onChange={onNetworkTypeHandler}
              value={networkType}
            >
              <MenuItem style={{margin: '8px'}} value='Klaytn'>Klaytn</MenuItem>
              <MenuItem style={{margin: '8px'}} value='Ethereum'>Ethereum</MenuItem>
              <MenuItem style={{margin: '8px'}} value='BSC'>BSC</MenuItem>
              <MenuItem style={{margin: '8px'}} value='Polygon'>Polygon</MenuItem>
              <MenuItem style={{margin: '8px'}} value='Terra'>Terra</MenuItem>
              <MenuItem style={{margin: '8px'}} value='Tron'>Tron</MenuItem>
            </Select>
          </FormControl>
        </Col>
      </Row>

      <Row 
        style={{
          textALign: 'center',
					paddingTop: '20px'
        }}>
        <Col>
          <div className='input-box'> 
            <FormControl fullWidth={true}>
              <InputLabel 
                id='address-name-label'
                style={{
                  color: '#828282', 
                  padding: '5px 0 0 8px', 
                  fontSize: '15px'
                }}>지갑 별명
              </InputLabel>
              <Input 
                labelId='address-name-label'
                id='address-name-input'
                disableUnderline={true}
                placeholder="지갑 별명"
                style={{padding: '0 0 2px 8px'}}
                onChange={checkWalletName}
              >
              </Input>
            </FormControl>
          </div>
        </Col>
      </Row>

			<Row style={{marginTop: '10x'}}>
        <Col style={{textAlign: 'left'}}>
          {statusMessage}
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
              backgroundColor: check ? '#615EFF' : '#BDBDBD', 
              borderColor: check ? '#615EFF' : '#BDBDBD', 
            }}
            block
            disabled={!check}
            // onClick={onSubmitHandler}
          >지갑 생성</Button>
        </Col>
      </Row>
      <NavBar myinfo={true} />
    </Container>
	);
}

export default withRouter(WalletCreatePage)