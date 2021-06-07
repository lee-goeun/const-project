import React, {useState} from 'react'; 

import {Container, Row, Col, Button} from 'react-bootstrap'; 
import axios from 'axios'; 

import { useHistory } from 'react-router-dom'; 
import { useDispatch } from 'react-redux'; 
import { withRouter } from 'react-router';


import { auth } from '_actions/user_action'; 
import NavBar from 'components/NavBar';

import './wallet_add_page.css'

import { 
  FormControl, 
  InputLabel,
  Select, 
  Input,
  MenuItem

} from '@material-ui/core'

import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';


function WalletImportPage(props) {

  const dispatch = useDispatch(); 
  const history = useHistory(); 


  const [userId, setUserId] = useState(''); 
  const [networkType, setNetworkType] = useState(''); 
  const [address, setAddress] = useState(''); 
  const [addressName, setAddressName] = useState(''); 
  
  const [statusMessage, setStatusMessage] = useState(setFormStatusMessage(''));
  const [check, setCheck] = useState(false); 


  React.useEffect(() => { 
    dispatch(auth()).then(res => {
      console.log('res: ', res) 
      if (res.payload) { 
        setUserId(res.payload._id); 
      }
    })
  }, []);

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

  const onAddressHandler = (e) => { 
    let address = e.target.value; 

    // TODO 
    // address 유효성 검사

    setAddress(address); 
    if (address) { 
      setStatusMessage(setFormStatusMessage('올바른 주소입니다')); 
      if (networkType) { setCheck(true) }
    } else { 
      setStatusMessage(setFormStatusMessage(''));
      setCheck(false); 
    }
  }

  const onAddressNameHandler = (e) => { setAddressName(e.target.value) };
  const onNetworkTypeHandler = (e) => { setNetworkType(e.target.value) };

  const onSubmitHandler = (event) => { 
    event.preventDefault(); 

    let data = {
      user_id: userId, 
      atype: networkType, 
      nick_name: addressName, 
      address
    };

    axios.post('/api/wallets/import', data)
      .then( (res) => { 
        console.log(res); 
        if (res.data.status) { 
          alert('지갑이 성공적으로 추가되었습니다')
          history.push('/myinfo/wallet')
        } else { 
          alert(`err occuered: ${res.data.msg}`)
        }
      })
      .catch( (err) => {alert(err); })
  }


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
          }}>지갑 주소로 추가</span>
        </Col>
      </Row>
      <Row style={{marginTop: '30px'}}>
        <Col>
          <p style={{
            fontSize: '12px', 
            fontWeight: 'bold', 
            textAlign: 'left'
          }}>네트워크를 선택한 후, 주소를 입력해주세요.</p>
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
                id='address-label'
                style={{
                  color: '#828282', 
                  padding: '5px 0 0 8px', 
                  fontSize: '15px'
                }}>지갑 주소
              </InputLabel>
              <Input 
                labelId='address-label'
                id='address-input'
                disableUnderline={true}
                placeholder="지갑 주소"
                style={{padding: '0 0 5px 8px'}}
                onChange={onAddressHandler}
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

      <Row 
        style={{
          textALign: 'center',
          paddingTop: '0'
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
                onChange={onAddressNameHandler}
              >
              </Input>
            </FormControl>
          </div>
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
            onClick={onSubmitHandler}
          >지갑 생성</Button>
        </Col>
      </Row>
      <NavBar myinfo={true} />
    </Container>
  )
}

export default withRouter(WalletImportPage)