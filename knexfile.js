module.exports = {

  development: {
    client: "better-sqlite3",
    useNullAsDefault: true,
    connection: {
      filename: "./db/dev.sqlite3"
    }
  }

};
