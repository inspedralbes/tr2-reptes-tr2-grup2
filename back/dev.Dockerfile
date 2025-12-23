FROM node:24-bookworm-slim

WORKDIR /usr/src/app

RUN npm install -g nodemon