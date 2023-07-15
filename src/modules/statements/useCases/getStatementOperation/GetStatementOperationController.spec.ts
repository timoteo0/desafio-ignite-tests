import { Connection, createConnection } from "typeorm";
import { v4 as uuid } from "uuid";
import { hash } from "bcryptjs";

import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Statement Operation Controller", () => {
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

  it("should be able to get user balance", async () => {
    const userToken = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com",
      password: "123",
    });

    const { token } = userToken.body;

    const statement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const { id } = statement.body;

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to get a non-existing statement", async () => {
    const userToken = await request(app).post("/api/v1/sessions").send({
      email: "test@example.com",
      password: "123",
    });

    const { token } = userToken.body;

    const invalidId = uuid();

    const response = await request(app)
      .get(`/api/v1/statements/${invalidId}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.statusCode).toBe(404);
  });
});
