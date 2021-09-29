# [API] Meetapp
[![Travis (.com)](https://img.shields.io/travis/com/DiegoVictor/meetapp-api?logo=travis&style=flat-square)](https://travis-ci.com/DiegoVictor/meetapp-api)
[![postgres](https://img.shields.io/badge/postgres-8.6.0-326690?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![redis](https://img.shields.io/badge/redis-3.1.2-d92b21?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![nodemon](https://img.shields.io/badge/nodemon-2.0.12-76d04b?style=flat-square&logo=nodemon)](https://nodemon.io/)
[![eslint](https://img.shields.io/badge/eslint-7.31.0-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![airbnb-style](https://flat.badgen.net/badge/style-guide/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![jest](https://img.shields.io/badge/jest-26.6.3-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![coverage](https://img.shields.io/codecov/c/gh/DiegoVictor/meetapp-api?logo=codecov&style=flat-square)](https://codecov.io/gh/DiegoVictor/meetapp-api)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://github.com/DiegoVictor/meetapp-api/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)<br>
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=Meetapp&uri=https%3A%2F%2Fraw.githubusercontent.com%2FDiegoVictor%2Fmeetapp-api%2Fmaster%2FInsomnia_2021-09-21.json)

Responsible for provide data to the [`web`](https://github.com/DiegoVictor/meetapp-web) and [`mobile`](https://github.com/DiegoVictor/meetapp-app) front-ends. Allow users to create their meetups' and/or subscribe to from other users. The app has, pagination, pagination's link header (to previous, next, first and last page), friendly errors, use JWT to logins, validation, also a simple versioning was made.

## Table of Contents
* [Installing](#installing)
  * [Configuring](#configuring)
    * [Redis](#redis)
    * [Postgres](#postgres)
      * [Migrations](#migrations)
      * [Seed](#seed)
    * [.env](#env)
* [Usage](#usage)
  * [Error Handling](#error-handling)
    * [Errors Reference](#errors-reference)
  * [Pagination](#pagination)
    * [Link Header](#link-header)
    * [X-Total-Count](#x-total-count)
  * [Bearer Token](#bearer-token)
  * [Versioning](#versioning)
  * [Routes](#routes)
    * [Requests](#requests)
* [Running the tests](#running-the-tests)
  * [Coverage report](#coverage-report)

# Installing
Easy peasy lemon squeezy:
```
$ yarn
```
Or:
```
$ npm install
```
> Was installed and configured the [`eslint`](https://eslint.org/) and [`prettier`](https://prettier.io/) to keep the code clean and patterned.

## Configuring
The application uses two databases: [Postgres](https://www.postgresql.org/) and [Redis](https://redis.io/). For the fastest setup is recommended to use [docker-compose](https://docs.docker.com/compose/), you just need to up all services:
```
$ docker-compose up -d
```

### Redis
Responsible to store data utilized by the mail queue. If for any reason you would like to create a Redis container instead of use `docker-compose`, you can do it by running the following command:
```
$ docker run --name meetapp-redis -d -p 6379:6379 redis:alpine
```

### Postgres
Responsible to store all application data. If for any reason you would like to create a Postgres container instead of use `docker-compose`, you can do it by running the following command:
```
$ docker run --name meetapp-postgres -e POSTGRES_PASSWORD=docker -p 5432:5432 -d postgres
```

#### Migrations
Remember to run the Postgres database migrations:
```
$ npx sequelize db:migrate
```
Or:
```
$ yarn sequelize db:migrate
```
> See more information on [Sequelize Migrations](https://sequelize.org/v5/manual/migrations.html).

#### Seed
Optionally you can fill the database with some random data:
```
$ npx sequelize db:seed:all
```
Or:
```
$ yarn sequelize db:seed:all
```

### .env
In this file you may configure your Redis database connection, JWT settings, the environment, app's port and a url to documentation (this will be returned with error responses, see [error section](#error-handling)). Rename the `.env.example` in the root directory to `.env` then just update with your settings.

|key|description|default
|---|---|---
|APP_URL|App's url.|`http://localhost`
|APP_PORT|Port number where the app will run.|`3333`
|NODE_ENV|App environment.|`development`
|JWT_SECRET|A alphanumeric random string. Used to create signed tokens.| -
|JWT_EXPIRATION_TIME|How long time will be the token valid. See [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#usage) repo for more information.|`7d`
|DB_HOST|Postgres host.| `pg`
|DB_PORT|Postgres port.| `5432`
|DB_USER|Postgres user.| -
|DB_PASS|Postgres password.| -
|DB_NAME|| `meetapp`
|MAIL_HOST|SMTP service's host.| `smtp.mailtrap.io`
|MAIL_PORT|SMTP service's port.| `2525`
|MAIL_USER|SMTP service's user| -
|MAIL_PASS|SMTP service's password| -
|REDIS_HOST|Redis host.|`redis`
|REDIS_PORT|Redis port.|`6379`
|SEQUELIZE_LOG|Indicates whether sequelize query operation logs should be shown.|`0`
|DOCS_URL|An url to docs where users can find more information about the app's internal code errors.|`https://github.com/DiegoVictor/meetapp-api#errors-reference`


# Usage
To start up the app run:
```
$ yarn dev:server
```
Or:
```
npm run dev:server
```
Also the application has a mail queue, to setup it just remember to run:
```
$ npm run queue
```
Or:
```
$ yarn queue
```
> The mail queue send emails to meetups' owner notifying when a user subscribes to it

## Error Handling
Instead of only throw a simple message and HTTP Status Code this API return friendly errors:
```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Token not provided",
  "code": 441,
  "docs": "https://github.com/DiegoVictor/meetapp-api#errors-reference"
}
```
> Errors are implemented with [@hapi/boom](https://github.com/hapijs/boom).
> As you can see a url to error docs are returned too. To configure this url update the `DOCS_URL` key from `.env` file.
> In the next sub section ([Errors Reference](#errors-reference)) you can see the errors `code` description.

### Errors Reference
|code|message|description
|---|---|---
|140|Past dates are not permited|You can't created meetup with past dates.
|141|The provided banner does not exists|The `banner_id` sent does not references an existing file in the database.
|142|You can't edit past meetups|Is not permitted update past meetups.
|143|You can't remove past meetups|Past meetup can't be deleted.
|144|Meetup does not exists|The provided meetup does not exists.
|240|Meetup does not exists or is owned by the provided user|Is not possible to create a subscripton from a meetup that not exists or a meetup owned by yourself.
|241|You can't subscribe to a past meetup|Is not possible to subscribe to past meetups.
|242|You are already subscribed to this meetup or there is another meetup in the same time|Conflict or hours or you are already subscribed.
|244|Meetup or user does not exists|You are trying delete a subscription from a meetup or user that not exists.
|340|Password does not match|You are trying to update the password with wrong old password.
|341|Email already in use|Email is already registered by another user.
|440|Password does not match|Wrong password when trying to login.
|441|Token not provided|The JWT token was not sent.
|442|Token invalid|The JWT token provided is invalid or expired.
|444|User not found|The JWT token not correspond to existing user.

## Pagination
All the routes with pagination returns 20 records per page, to navigate to other pages just send the `page` query parameter with the number of the page.

* To get the third page of meetups:
```
GET http://localhost:3333/v1/meetups?page=3
```

### Link Header
Also in the headers of every route with pagination the `Link` header is returned with links to `first`, `last`, `next` and `prev` (previous) page.
```
<http://localhost:3333/v1/meetups?page=7>; rel="last",
<http://localhost:3333/v1/meetups?page=4>; rel="next",
<http://localhost:3333/v1/meetups?page=1>; rel="first",
<http://localhost:3333/v1/meetups?page=2>; rel="prev"
```
> See more about this header in this MDN doc: [Link - HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link).

### X-Total-Count
Another header returned in routes with pagination, this bring the total records amount.

## Bearer Token
A few routes expect a Bearer Token in an `Authorization` header.
> You can see these routes in the [routes](#routes) section.
```
GET http://localhost:3333/v1/subscriptions Authorization: Bearer <token>
```
> To achieve this token you just need authenticate through the `/sessions` route and it will return the `token` key with a valid Bearer Token.

## Versioning
A simple versioning was made. Just remember to set after the `host` the `/v1/` string to your requests.
```
GET http://localhost:3333/v1/subscriptions
```

## Routes
|route|HTTP Method|pagination|params|description|auth method
|:---|:---:|:---:|:---:|:---:|:---:
|`/sessions`|POST|:x:|Body with user's `email` and `password`.|Authenticates user, return a Bearer Token and user's id and email.|:x:
|`/users`|POST|:x:|Body with user's `name`, `email` and `password`.|Create new users.|:x:
|`/users`|PUT|:x:|Body with user's `name`, `email` and `old_password`, `password` and `confirm_password`.|Update an existing users.|Bearer
|`/files`|POST|:x:|Multipart payload with a `file` field with a image (See insomnia file for good example).|Upload meetup banner.|Bearer
|`/meetups`|GET|:heavy_check_mark:|`page` query parameter.|Lists meetups.|Bearer
|`/meetups`|POST|:x:|Body with meetup's banner_id `date`, `description`, `localization` and `title`.|Create meetups.|Bearer
|`/meetups`|PUT|:x:|Body with meetup's banner_id `date`, `description`, `localization` and `title`.|Update a meetup.|Bearer
|`/meetups/:id`|DELETE|:x:|`id` of the meetup.|Delete a meetups.|Bearer
|`/scheduled`|GET|:x:| - |Lists logged in user's meetups.|Bearer
|`/scheduled/:id`|GET|:x:|`id` of the meetup.|Show one logged in user's meetup.|Bearer
|`/subscritions`|GET|:heavy_check_mark:| - |Lists logged in user's subscriptions.|Bearer
|`/subscritions`|POST|:x:|Body with subscription's `meetup_id`.|Subscribe yourself to a meetup.|Bearer
|`/subscritions/:id`|DELETE|:x:|Body with meetups's `id`.|Unsubscribe yourself from a meetup.|Bearer

> Routes with `Bearer` as auth method expect an `Authorization` header. See [Bearer Token](#bearer-token) section for more information.

### Requests
* `POST /session`

Request body:
```json
{
  "email": "johndoe@example.com",
  "password": "123456"
}
```

* `POST /users`

Request body:
```json
{
  "email": "johndoe@example.com",
  "name": "John Doe",
  "password": "123456"
}
```

* `PUT /users`

Request body:
```json
{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "old_password": "123456",
  "password": "123456789",
  "confirm_password": "123456789"
}
```

* `POST /files`

Image file


* `POST /meetups`

Request body:
```json
{
  "banner_id": 1,
  "date": "2020-12-30",
  "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "localization": "4795 Denesik Throughway Kaileefurt, NC 07927-4723",
  "title": "Creative Planner"
}
```

* `PUT /meetups`

Request body:
```json
{
  "banner_id": 1,
  "date": "2020-12-31",
  "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "localization": "64504 Stehr Motorway Tellyfort, IL 33915-6894",
  "title": "Lead Quality Director"
}
```

* `PUT /subscriptions`

Request body:
```json
{
  "meetup_id": 1,
}
```

# Running the tests
[Jest](https://jestjs.io/) was the choice to test the app, to run:
```
$ yarn test
```
Or:
```
$ npm run test
```

## Coverage report
You can see the coverage report inside `tests/coverage`. They are automatically created after the tests run.
