
const { validationResult } = require("express-validator");

const buildTasksRouter = function buildTasksRouter ({ knex, log }) {

  const getRequestUser = async function getRequestUser (req) {
    const [user] = await knex("users")
                          .where({ username: req.decodedToken.sub });
    return user;
  };

  const queryTasks = function queryTasks ({ user, validSatuses = [], invalidStatuses = [] }) {
    const query = knex("tasks")
                    .join("tasks_users", "tasks.id", "tasks_users.task_id")
                    .where({ user_id: user.id });
    if (validSatuses.length) query.whereIn("status", validSatuses);
    if (invalidStatuses.length) query.whereNotIn("status", invalidStatuses);
    return query;
  };

  const getAllActiveTasks = async function getAllActiveTasks (req, res) {
    try {
      const user = await getRequestUser(req);
      const tasks = await queryTasks({ user, invalidStatuses: ["ARCHIVED" ]});
      res.json(tasks);
    } catch (err) {
      log.error(err);
      res.status(500).json(err);
    }
  };

  const getAllTasks = async function getAllTasks (req, res) {
    try {
      const user = await getRequestUser(req);
      const validSatuses = req.query.status ? req.query.status.split(",") : [];
      const tasks = await queryTasks({ user, validSatuses });
      res.json(tasks);
    } catch (err) {
      log.error(err);
      res.status(500).json(err);
    }
  };

  const updateTask = async function updateTask (req, res) {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
      } else {
        const [task] = await knex("tasks").where({ id: req.params.id });
        const updatedTask = { ...task, status: req.body.status };
        await knex("tasks").update(updatedTask).where({ id: task.id });
        res.json(updatedTask);
      }
    } catch (err) {
      log.error(err);
      res.status(500).json(err);
    }
  };

  return {
    getAllActiveTasks,
    getAllTasks,
    updateTask
  };
};

module.exports = buildTasksRouter;
