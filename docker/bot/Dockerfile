# syntax=docker/dockerfile:1

FROM node:current-alpine

WORKDIR /wheatley/bot

COPY ./package.json ./package-lock.json .

RUN npm ci

COPY . .

RUN npm run build

ENTRYPOINT ["node", "build/src/main.js"]
