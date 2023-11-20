FROM node:16.20.2-bullseye as base

WORKDIR /app

COPY tsconfig*.json ./
COPY package*.json ./

RUN apt-get update && \
  apt install -y curl && \
  npm install -g @nestjs/cli

COPY . .

EXPOSE 3000

FROM base as prod

RUN npm ci && \
  npm run prebuild && \
  npm run build

CMD ["npm", "run", "start:prod"]
