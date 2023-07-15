import { Connection, createConnection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();

    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "johndoe@gmail.com",
      password: "1234",
    });

    expect(response.statusCode).toEqual(201);
  });

  it("should not be able to create an existing user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "johndoe@gmail.com",
      password: "1234",
    });

    expect(response.statusCode).toEqual(400);
  });
});
