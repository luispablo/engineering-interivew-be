
const buildApp = require("../app/server");
const dotenv = require("dotenv");

const { unlink } = require("fs/promises");

const testSetup = async function testSetup ({ dbFilename }) {

  dotenv.config({ path: "test/.env" });
  
  const authSecretKey = process.env.AUTH_SECRET_KEY;
  const logFilename = process.env.LOG_FILENAME;

  knex = require("knex")({
    client: "better-sqlite3",
    connection: { filename: dbFilename },
    useNullAsDefault: true
  });
  app = buildApp({ authSecretKey, connectionString: dbFilename, logFilename });
  await knex.migrate.latest();

  const destroy = async function destroy () {
    await unlink(dbFilename);
    knex.destroy();
    app.close();
  };

  return {
    app,
    destroy,
    knex
  };
};

module.exports = testSetup;
