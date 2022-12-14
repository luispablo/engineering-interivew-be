
exports.up = function (knex) {
  return knex.schema.createTable("tasks_users", function (table) {
    table.increments("id");
    table.integer("task_id").unsigned();
    table.foreign("task_id").references("id").inTable("tasks");
    table.integer("user_id").unsigned();
    table.foreign("user_id").references("id").inTable("users");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tasks_users");
};
