import { v4 as uuid } from "uuid";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { OperationType } from "../createStatement/CreateStatementController";
import { GetBalanceError } from "./GetBalanceError";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get User Balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get a user balance", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "John Doe",
      email: "johndoe@gmail.com",
      password: "1234",
    });
    const user_id = !user.id ? uuid() : user.id;

    const statement = await inMemoryStatementsRepository.create({
      amount: 50,
      type: OperationType.DEPOSIT,
      description: "asdf",
      user_id,
    });

    const result = await getBalanceUseCase.execute({ user_id });

    expect(result).toHaveProperty("statement");
    expect(result).toHaveProperty("balance");
    expect(result.statement).toHaveLength(1);
    expect(result.balance).toEqual(statement.amount);
    expect(result.statement[0]).toMatchObject(statement);
  });

  it("should not be able to get a non-existent user balance", async () => {
    await expect(
      getBalanceUseCase.execute({ user_id: "test id" })
    ).rejects.toEqual(new GetBalanceError());
  });
});
