FROM node:24-bookworm-slim

WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y openssl && apt-get clean

RUN npm install -g nodemon