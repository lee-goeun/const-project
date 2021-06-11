import React, { useState, useEffect } from 'react'; 

import { useHistory } from 'react-router-dom'; 

import axios from 'axios'; 

import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Container, Row, Col, Button } from 'react-bootstrap'; 
import { Box, Divider } from '@material-ui/core'
import NavBar from 'components/NavBar';
import { setTimeout } from 'timers';


function LoginSetupPage(props) {

	const history = useHistory(); 

	const [devices, setDevices] = useState([
		{ date: "2021/04/25 06:49:08", os: "윈도우 10.0 크롬 90", loc: "211.86.132.114 대한민국" }, 
		{ date: "2021/04/25 06:49:08", os: "윈도우 10.0 크롬 90", loc: "211.86.132.114 대한민국" }, 
		{ date: "2021/04/25 06:49:08", os: "윈도우 10.0 크롬 90", loc: "211.86.132.114 대한민국" }, 
		{ date: "2021/04/25 06:49:08", os: "윈도우 10.0 크롬 90", loc: "211.86.132.114 대한민국" }, 
	]);

	// TODO: 데이터 가져오자
	// 로그인 된 디바이스 목록 가져오기
	function getDevices() {
		console.log("디바이스 목록 가져와");		
	}

	useEffect(()=>{
		getDevices();	// 왜 useEffect 안에서 setState하면 안될까
	});

	return (
			<Container>
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
						}}>로그인 관리</span>
					</Col>
				</Row>

				{/* 바디 */}
				<div style={{ display: "flex", flexDirection: "column", height: "65vh"}}>
					<Box style={{width: '100%', margin: "1.5rem 0", textAlign: "left", lineHeight: "1.1", height: "1" }}>
						<span style={{fontSize: '0.7rem', whiteSpace: 'pre-wrap'}}>{'회원님의 로그인 이력입니다.\n직접 로그인하지 않은 기록이 있다면 즉시 비밀번호 변경 및\n모든 디바이스에서 로그아웃 해주세요.\n' }</span>
					</Box>
					<hr 
						style={{    
							width: '100%',
							// position: 'absolute',
							margin: '0 auto',
							left: '0',
							right: '0',
						}}
					/>

					<Box style={{ margin: "20px 0 0 0", overflowY: "auto", overflowX: "hidden", height:"8"}}>
						{ devices.map(device => {
							return (
							<div style={{ padding:"10px 0", display: 'flex', flexDirection: 'row', alignContent:"space-between", fontSize: "0.8rem", textAlign: "left" }}>
								<span>{device.date}</span><span>{device.os}</span><span>{device.loc}</span>
							</div>);
						})}
					</Box>

					
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
								// onClick={() => { history.push('/myinfo/wallet/new') } }
							>모든 디바이스에서 로그아웃
							</Button>
						</Col>
					</Row>
				</div>

				{/* 하단 메뉴 */}
				<NavBar myinfo={true}/>
			</Container>
	);

}

export default LoginSetupPage;