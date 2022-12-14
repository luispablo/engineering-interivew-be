
exports.up = function (knex) {
  return knex.schema.createTable("tasks", function (table) {
    table.increments("id");
    table.string("title"); // FIXME: length, nullable?
    table.string("description"); // FIXME: length, nullable?
    table.string("status"); // TODO: check valid values?
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tasks");
};
