import { Connection, createConnection } from "typeorm";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();

    const id = uuid();
    const password = await hash("123", 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password, created_at, updated_at)
      VALUES('${id}', 'test', 'test@example.com', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com",
      password: "123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("id");
  });

  it("should not be able to authenticate a non-existing user", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "incorrect_email@example.com",
      password: "123",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toEqual("Incorrect email or password");
  });

  it("should not be able to authenticate a user with incorrect password", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com",
      password: "incorrect_password",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toEqual("Incorrect email or password");
  });
});
