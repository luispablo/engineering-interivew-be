
const buildAPIRouter = require("./apiRouter");
const bunyan = require("bunyan");
const express = require("express");

const buildApp = function buildApp ({ authSecretKey, connectionString, logFilename }) {
  
  const log = bunyan.createLogger({
    name: "tasks-api",
    streams: [
      { level: "debug", path: logFilename }
    ]
  });

  const knex = require("knex")({
    client: "better-sqlite3",
    connection: { filename: connectionString },
    useNullAsDefault: true
  });

  const apiRouter = buildAPIRouter({ authSecretKey, knex, log });
  const app = express();

  app.use(express.json());
  app.use("/api", apiRouter);
  app.close = () => knex.destroy();

  return app;
}

module.exports = buildApp;
