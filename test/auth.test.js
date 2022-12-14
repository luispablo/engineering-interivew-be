
const request = require("supertest");
const testSetup = require("./testSetup");

const { hash } = require("bcrypt");
const { expect } = require("chai");

const TEST_USERNAME_01 = "test_user_01";
const TEST_PASSWORD_01 = "test_pass_01";

let context, jwt;

describe("API /auth", function () {
  before(async function () {
    context = await testSetup({ dbFilename: "auth_ut.sqlite" });
  
    const passwordHash1 = await hash(TEST_PASSWORD_01, 10);
    await context.knex("users").insert({ username: TEST_USERNAME_01, hash: passwordHash1 });
    const res = await request(context.app)
      .post("/api/auth/token")
      .send({ username: TEST_USERNAME_01, password: TEST_PASSWORD_01 });
    jwt = res.body.token;
  });

  it("should reply 401 (unauthorized) to invalid username", async function () {
    const res = await request(context.app)
      .post("/api/auth/token")
      .send({ username: "wrong_username", password: "wrong_password" });
    expect(res.status).to.equal(401);
  });

  it("should reply 401 (unauthorized) to invalid password", async function () {
    const res = await request(context.app)
      .post("/api/auth/token")
      .send({ username: TEST_USERNAME_01, password: "wrong_password" });
    expect(res.status).to.equal(401);
  });

  it("should give a new JWT with valid credentials", async function () {
    const res = await request(context.app)
      .post("/api/auth/token")
      .send({ username: TEST_USERNAME_01, password: TEST_PASSWORD_01 });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("token");
    expect(res.body.user).to.deep.include({
      id: 1,
      roles: [],
      username: TEST_USERNAME_01
    });
  });

  after(async function () {
    await context.destroy();
  });
});

