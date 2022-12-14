
const buildApp = require("./app/server");

const authSecretKey = process.env.AUTH_SECRET_KEY;
const logFilename = process.env.LOG_FILENAME;
const connectionString = process.env.CONNECTION_STRING;

const app = buildApp({ authSecretKey, connectionString, logFilename });

const port = process.env.PORT || 3000;
const host = process.env.HOST || "0.0.0.0";

app.listen(port, host, () => console.log(`Running on port http://${host}:${port}`));
