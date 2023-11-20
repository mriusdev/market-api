# FROM node:18.18-alpine as base
# FROM node:18.18.0-bullseye as base
FROM node:16.20.2-bullseye as base

WORKDIR /app

COPY tsconfig*.json ./
COPY package*.json ./

RUN apt-get update && \
  apt install -y curl && \
  npm install -g @nestjs/cli

COPY . .

# FROM base as dev

# RUN npm install

EXPOSE 3000

# CMD ["npm", "run", "start:dev"]

FROM base as prod

RUN npm ci && \
  npm run prebuild && \
  npm run build

CMD ["npm", "run", "start:prod"]

