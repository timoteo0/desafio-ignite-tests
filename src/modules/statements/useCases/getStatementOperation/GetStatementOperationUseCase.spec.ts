import { v4 as uuid } from "uuid";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { OperationType } from "../createStatement/CreateStatementController";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get User Balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get a statement operation", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "John Doe",
      email: "johndoe@gmail.com",
      password: "1234",
    });
    const user_id = !user.id ? uuid() : user.id;

    const statement = await inMemoryStatementsRepository.create({
      amount: 50,
      type: OperationType.DEPOSIT,
      description: "test",
      user_id,
    });
    const statement_id = !statement.id ? uuid() : statement.id;

    const result = await getStatementOperationUseCase.execute({
      statement_id,
      user_id,
    });

    expect(result).toHaveProperty("id");
    expect(result.amount).toEqual(statement.amount);
    expect(result).toBeTruthy();
  });

  it("should not be able to get a non-existent statement operation", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "John Doe",
      email: "johndoe@gmail.com",
      password: "1234",
    });
    const user_id = !user.id ? uuid() : user.id;

    await expect(
      getStatementOperationUseCase.execute({
        statement_id: "statement test",
        user_id,
      })
    ).rejects.toEqual(new GetStatementOperationError.StatementNotFound());
  });

  it("should not be able to get a non-existent user", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "John Doe",
      email: "johndoe@gmail.com",
      password: "1234",
    });
    const user_id = !user.id ? uuid() : user.id;

    const statement = await inMemoryStatementsRepository.create({
      amount: 50,
      type: OperationType.DEPOSIT,
      description: "test",
      user_id,
    });
    const statement_id = !statement.id ? uuid() : statement.id;

    await expect(
      getStatementOperationUseCase.execute({
        statement_id,
        user_id: "user test",
      })
    ).rejects.toEqual(new GetStatementOperationError.UserNotFound());
  });
});
