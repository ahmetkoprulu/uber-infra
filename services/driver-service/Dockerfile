FROM node:12

WORKDIR /services/driver-service

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "./src/index.js" ]