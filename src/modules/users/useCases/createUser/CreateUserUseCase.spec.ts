import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const result = await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@gmail.com",
      password: "1234",
    });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("email");
    expect(result.name).toEqual("John Doe");
  });

  it("should not be able to create an existing user", async () => {
    await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@gmail.com",
      password: "1234",
    });

    await expect(
      createUserUseCase.execute({
        name: "John Doe",
        email: "johndoe@gmail.com",
        password: "1234",
      })
    ).rejects.toEqual(new CreateUserError());
  });
});
