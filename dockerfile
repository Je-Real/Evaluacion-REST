FROM node:carbon-alpine
RUN mkdir /eval
COPY package.json .
COPY . .
WORKDIR .
RUN npm install
EXPOSE 3000
CMD node server.js