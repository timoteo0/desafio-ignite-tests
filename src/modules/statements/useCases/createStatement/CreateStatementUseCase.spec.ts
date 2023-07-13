import { v4 as uuid } from "uuid";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";
import { OperationType } from "./CreateStatementController";
import { CreateStatementError } from "./CreateStatementError";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create a Statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to create a new deposit statement", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "John Doe",
      email: "johndoe@gmail.com",
      password: "1234",
    });

    const user_id = !user.id ? uuid() : user.id;

    const statementData: ICreateStatementDTO = {
      amount: 100,
      description: "description test",
      type: OperationType.DEPOSIT,
      user_id,
    };

    const statement = await createStatementUseCase.execute(statementData);

    expect(statement).toHaveProperty("id");
    expect(statement.type).toEqual(OperationType.DEPOSIT);
    expect(statement.amount).toBe(statementData.amount);
  });

  it("should be able to create a new deposit statement", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "John Doe",
      email: "johndoe@gmail.com",
      password: "1234",
    });

    const user_id = !user.id ? uuid() : user.id;

    await createStatementUseCase.execute({
      amount: 100,
      description: "description test",
      type: OperationType.DEPOSIT,
      user_id,
    });

    const statementData: ICreateStatementDTO = {
      amount: 50,
      description: "description test",
      type: OperationType.WITHDRAW,
      user_id,
    };

    const statement = await createStatementUseCase.execute(statementData);

    expect(statement).toHaveProperty("id");
    expect(statement.type).toEqual(OperationType.WITHDRAW);
    expect(statement.amount).toBe(statementData.amount);
  });

  it("should not be able to create a new statement with non-existent user", async () => {
    await expect(
      createStatementUseCase.execute({
        amount: 100,
        description: "description test",
        type: OperationType.DEPOSIT,
        user_id: "non-existent id",
      })
    ).rejects.toEqual(new CreateStatementError.UserNotFound());
  });

  it("should not be able to withdraw with insufficient funds", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "John Doe",
      email: "johndoe@gmail.com",
      password: "1234",
    });

    const user_id = !user.id ? uuid() : user.id;

    await expect(
      createStatementUseCase.execute({
        amount: 100,
        description: "description test",
        type: OperationType.WITHDRAW,
        user_id,
      })
    ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });
});
