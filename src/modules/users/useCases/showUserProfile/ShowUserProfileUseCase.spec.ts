import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { v4 as uuid } from "uuid";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to show user profile", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "John Doe",
      email: "johndoe@gmail.com",
      password: "1234",
    });

    const userId = !user.id ? uuid() : user.id;

    const result = await showUserProfileUseCase.execute(userId);

    expect(result).toHaveProperty("id");
    expect(result.id).toEqual(userId);
  });

  it("should not be able to show a non-existent user profile", async () => {
    await expect(showUserProfileUseCase.execute("id")).rejects.toEqual(
      new ShowUserProfileError()
    );
  });
});
