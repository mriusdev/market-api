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

Database migrations & seeding
```bash
# inside backend docker container
# migrates tables
$ npx prisma migrate dev
```
```bash
# inside backend docker container
# seeds tables
$ npx prisma db seed
```

Running app
```bash
# inside backend docker container
$ npm run start dev
```