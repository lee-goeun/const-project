FROM node:14.16.0

RUN mkdir /app
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json


RUN npm install --silent
RUN npm install nodemon -g --silent 
RUN npm install npm-run-all -g --silent
RUN npm audit fix

COPY . /app
CMD ["npm", "start"]