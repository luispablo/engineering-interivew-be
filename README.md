# Tasks API

## Installing & running tests

```sh
$ npm i
$ npm test
```

## Running with docker

### Building the docker image

```sh
$ docker build -t tasks-api --network=host .
```

### Running the container

**IMPORTANT** Create an ```.env``` file with the following parameters:

- AUTH_SECRET_KEY=n2r5u8x!A%D*G-KaPdSgVkYp3s6v9y$B?EAH+MbQeThWmZq4t7w!z%C*F-J@NcRf
- LOG_FILENAME=log/tasks_api.log
- CONNECTION_STRING=./db/dev.sqlite3
- PORT=8080

(or just copy the ```.env.sample``` file)

Then you can run with the following command:

```sh
docker run --rm --env-file=./.env -p 8080:8080 --name tasks-api --network host tasks-api
```

### Running some queries against the running instance

1. Create a token with user credentials

```sh
curl -s -X POST -H "Content-Type: application/json" http://localhost:8080/api/auth/token -d '{ "username": "admin", "password": "admin" }'
```

Take the ```token``` property from the response for the next request.

2. Query some active tasks for that user

```sh
curl http://localhost:8080/api/tasks/active -H "x-access-token: <token>"
```

## Logging

The logging feature is provided with the [Bunyan module](https://github.com/trentm/node-bunyan). The ```LOG_FILENAME``` environment variable sets the filed used for it.
As Bunyan uses a particular format for its logs, to see it with a more human-friendly format you can use the following command:

```sh
$ cat log/tasks_api.log | node_modules/bunyan/bin/bunyan
```

Or, to keep the logs flowing while the app runs:

```sh
$ tail -f log/tasks_api.log | node_modules/bunyan/bin/bunyan
```

## Notes

- The ```.nvmrc``` is used to set the NodeJS version for dev or test environments outside of a container (using [Node Version Manager](https://github.com/nvm-sh/nvm))

## TODOs

- [x] Test locally using Docker
- [x] Test local DB
- [x] Document how to set-up the project (and UT, and logging)
- [x] Document how to start docker and test some endpoints
- [ ] Install from scratch an see all works OK
- [ ] "and are authorized to view their tasks" ??

---

# Original requirements

## Getting Started with the Every.io engineering challenge.

Thanks for taking the time to complete the Every.io code challenge. Don't worry, it's not too hard, and please do not spend more than an hour or two. We know you have lots of these to do, and it can be very time consuming.

### The biggest factor will be your code:

1. How readable, is your code.
2. Scalability.
3. Are there any bugs.

### Requirements

You will be creating an API for a task application.

1. This application will have tasks with four different states:
   - To do
   - In Progress
   - Done
   - Archived
2. Each task should contain: Title, Description, and what the current status is.
3. A task can be archived and moved between columns, or statuses.
4. The endpoint for tasks should only display tasks for those users who have authenticated and are authorized to view their tasks.

### Ideal

- Typescript
- Tests
- Dockerized Application

### Extra credit

- Apollo Server GraphQL
- Logging
