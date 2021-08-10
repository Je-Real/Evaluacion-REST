FROM node:carbon-alpine
RUN mkdir /eval
COPY package.json /eval
COPY /. /eval
WORKDIR /eval
RUN npm install
EXPOSE 80
CMD node server.js