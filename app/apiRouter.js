
const buildTasksRouter = require("./routers/tasksRouter");
const express = require("express");
const initTokenauth = require("tokenauth");

const { compare } = require("bcrypt");
const { body } = require("express-validator");

const VALID_TASKS_STATUS = ["TO_DO", "IN_PROGRESS", "DONE", "ARCHIVED"];

const buildAPIRouter = function buildAPIRouter ({ authSecretKey, knex, log }) {
  
  const router = express.Router();
  
  const authenticate = async function authenticate (username, password) {
    const [user] = await knex("users").where({ username });

    if (user && await compare(password, user.hash)) {
      return user;
    } else {
      throw { code: 401 };
    }
  };

  const tokenauth = initTokenauth({ token: {
    secret: authSecretKey,
    validDays: 90
  }});
  const authRoutes = tokenauth.Router({ authenticate }, authSecretKey, 90);

  const tasksRouter = buildTasksRouter({ knex, log });

  router.post("/auth/token", authRoutes.createToken);
  router.get("/auth/validate_token", authRoutes.validateToken);
  router.delete("/auth/token", authRoutes.deleteToken);
  
  router.get("/tasks/active", tokenauth.Middleware, tasksRouter.getAllActiveTasks);
  router.put("/tasks/:id", tokenauth.Middleware, body("status").isIn(VALID_TASKS_STATUS), tasksRouter.updateTask); // TODO: Move validator to router
  router.get("/tasks", tokenauth.Middleware, tasksRouter.getAllTasks);

  return router;
};

module.exports = buildAPIRouter;
