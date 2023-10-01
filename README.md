## Description

Marketplace API.
- Create users
- Manage login sessions
- CRUD functionality for listings
- Image uploads

## Setup

Build and start docker containers
```bash
$ make up build
```

Install dependencies, create prisma configuration files
```bash
# open backend container's shell
# install dependencies
$ npm install
```
```bash
# generate prisma config files
$ npx prisma generate
```
```bash
# start the app
$ npm run start dev
```
