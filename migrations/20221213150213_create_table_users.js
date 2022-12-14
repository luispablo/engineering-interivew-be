
exports.up = function (knex) {
  return knex.schema.createTable("users", function (table) {
    table.increments("id");
    table.string("username"); // FIXME: length, nullable?
    table.string("hash"); // FIXME: length, nullable?
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
