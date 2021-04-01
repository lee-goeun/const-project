# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:


### 방법 1) Local에서 git clone 후 해당 디렉토리에서 개발 시, 서버 실행 방법 
``` bash
$ npm install 
$ npm install nodemon npm-run-all -g 
$ npm start    # run React && Express Server 
```
이후 웹사이트 실행 [http://localhost:3000](http://localhost:3000)



### 방법 2) Docker-compose를 통한 WAS 실행 및 Web Server 실행(배포) 
``` bash
$ docker-compose up -d --build    # Docker Container 실행 
$ docker-compose down             # Docker Conatiner 실행 중지
$ docker-compose logs             # Docker 로그 보기
```
Conatiner up 이후 웹사이트 실행 [http://localhost](http://localhost) or [http://your-domain-name/ip-address]
