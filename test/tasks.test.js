
const request = require("supertest");
const testSetup = require("./testSetup");

const { hash } = require("bcrypt");
const { expect } = require("chai");

const USERS = [
  { username: "test_user_01", password: "test_pass_01" },
  { username: "test_user_02", password: "test_pass_02" }
];

const TASKS = [
  { title: "Task 01", description: "Test task number 1", status: "TO_DO" },
  { title: "Task 02", description: "Test task number 2", status: "IN_PROGRESS" },
  { title: "Task 03", description: "Test task number 3", status: "DONE" },
  { title: "Task 04", description: "Test task number 4", status: "ARCHIVED" },
  { title: "Task 05", description: "Test task number 5", status: "TO_DO" }
];

let context, jwt, tasksIds;

describe("API /tasks", function() {
  before(async function () {
    context = await testSetup({ dbFilename: "tasks_ut.sqlite" });
  
    USERS[0].hash = await hash(USERS[0].password, 10);
    USERS[1].hash = await hash(USERS[1].password, 10);

    const ids = await context.knex("users").insert(USERS.map(u => ({ username: u.username, hash: u.hash }))).returning("id");
    USERS[0].id = ids[0].id;
    USERS[1].id = ids[1].id;

    const res = await request(context.app)
                        .post("/api/auth/token")
                        .send({ username: USERS[0].username, password: USERS[0].password });
    jwt = res.body.token;
  });
  
  beforeEach(async function () {
    tasksIds = (await Promise.all(TASKS.map(t => context.knex("tasks").insert(t).returning("id")))).map(r => r[0].id);
    await Promise.all(tasksIds.slice(0, 4).map(task_id => context.knex("tasks_users").insert({ user_id: USERS[0].id, task_id })));
    await context.knex("tasks_users").insert({ user_id: USERS[1].id, task_id: tasksIds[4] });
  });

  it("should reply 401 when no JWT provided", async function () {
    const response = await request(context.app)
                            .get("/api/tasks/active")
                            .set("Accept", "application/json");
    expect(response.status).to.equal(401);
  });
  
  it("should respond with json content", async function () {
    const response = await request(context.app)
                            .get("/api/tasks/active")
                            .set("x-access-token", jwt);
    expect(response.status).to.equal(200);
    expect(response.headers["content-type"]).to.match(/json/);
  });
  
  it("should finds no task", async function () {
    await context.knex("tasks_users").del();
    await context.knex("tasks").del();
    const res = await request(context.app)
                        .get("/api/tasks/active")
                        .set("x-access-token", jwt);
    expect(res.body).to.deep.equal([]);
  });
  
  it("should reply with active user tasks", async function () {
    const res = await request(context.app)
                        .get("/api/tasks/active")
                        .set("x-access-token", jwt);
    expect(res.body.some(i => i.status === "ARCHIVED"), "No tasks with status ARCHIVED").to.be.false;
    expect(res.body).to.have.lengthOf(3);
  });

  it("should give archived tasks", async function () {
    const res = await request(context.app)
                        .get("/api/tasks?status=ARCHIVED")
                        .set("x-access-token", jwt);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.lengthOf(1);
    expect(res.body[0]).to.include({ status: "ARCHIVED" });
  });

  it("should reply with ALL user tasks (active + archived)", async function () {
    const res = await request(context.app)
                        .get("/api/tasks")
                        .set("x-access-token", jwt);
    expect(res.body).to.have.lengthOf(4);
  });

  it("should get tasks in TO_DO or DONE", async function () {
    const res = await request(context.app)
                        .get("/api/tasks?status=TO_DO,DONE")
                        .set("x-access-token", jwt);
    expect(res.body.every(i => i.status === "TO_DO" || i.status === "DONE")).to.be.true;
    expect(res.body).to.have.lengthOf(2);
  });

  it("should move tasks between columns", async function () {
    const [task1] = await context.knex("tasks").where({ id: tasksIds[0] });
    expect(task1.status).to.not.equal("DONE");
    const res = await request(context.app)
                        .put(`/api/tasks/${task1.id}`)
                        .set("x-access-token", jwt)
                        .send({ status: "DONE" });
    expect(res.status).to.equal(200);
    const [task1Updated] = await context.knex("tasks").where({ id: tasksIds[0] });
    expect(task1Updated.status).to.equal("DONE");
  });

  it("should only accept valid status: TO_DO, IN_PROGRESS, DONE or ARCHIVED", async function () {
    const [task1] = await context.knex("tasks").where({ id: tasksIds[0] });
    const res = await request(context.app)
                        .put(`/api/tasks/${task1.id}`)
                        .set("x-access-token", jwt)
                        .send({ status: "SOME_INVALID_STATUS" });
    expect(res.status).to.equal(422);
    expect(res.body.errors).to.deep.equal([{
      value: "SOME_INVALID_STATUS",
      msg: "Invalid value",
      param: "status",
      location: "body"
    }]);
  });
  
  afterEach(async function () {
    await context.knex("tasks_users").del();
    await context.knex("tasks").del();
  });

  after(async function () {
    await context.destroy();
  });
});

