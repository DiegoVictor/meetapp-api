# Install
Easy peasy lemon squeezy

## Repo and Dependencies
Just clone the repo, then install the project's dependencies:
```
$ git clone https://github.com/DiegoVictor/meetapp-api.git
$ cd meetapp-api
$ yarn
```

## Database
The project use two databases: postgres and redis. We will use docker here to start up faster:
```
$ docker run --name meetapp -e POSTGRES_PASSWORD=docker -p 5432:5432 -d postgres
```
If the image not start automatically, run:
```
$ docker start meetapp
```

To redis the process is basically the same:
```
$ docker run --name redismeetapp -p 6379:6379 -d -t redis:alpine
$ docker start redismeetapp
```

### Seed
Optionally you can fill the database with some random data:
```
$ yarn sequelize db:seed:all
```

## .env
Just copy the `.env.example` in the application folder and set the remaning settings.

The first block is the application settings, the `APP_SECRET` is used to encrypt passwords
```
APP_URL=http://localhost
APP_PORT=3333
APP_SECRET=c8ca2b37536277952488afa5ab7ac8e9
NODE_ENV=development
```

Below you must configure the postgres settings:
```
DB_DIALECT=postgres
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASS=docker
DB_NAME=meetapp
```

In the next block you can configure the mail service. If necessary you can do more configurations in the `src/config/mail.js` file.

By default redis is already configurated, but if necessary feel free to update it:
```
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

> If you are on Windows using Docker Toolbox maybe you need set your redis and postgres host to `192.168.99.100`

## LOG
Optionally you can configure a sentry project to log errors:
```
LOG=1
SENTRY_DSN=<sentry dsn>
SEQUELIZE_LOG=0
```
> Set `LOG` to  `0` if you do not want to log errors in Sentry. Set `SEQUELIZE_LOG` to disable sequelize's terminal logs

# Run
Finally you can run the application. First run the email queue:
```
$ yarn queue
```
Then the server:
```
$ yarn dev
```

# Tests
```
$ yarn test
```