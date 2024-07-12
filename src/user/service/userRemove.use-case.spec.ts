import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../repository/user.repository';
import { RemoveUserDto } from './dto/RemoveUserDto';
import { NotFoundError } from './errors/NotFoundError';
import { UserRemoveUseCase } from './userRemove.use-case';

describe('UserRemoveUseCase', () => {
  let useCase: UserRemoveUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findById: jest.fn(),
    reassignUsersSupervisorWith: jest.fn(),
    removeById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRemoveUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<UserRemoveUseCase>(UserRemoveUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should remove user and return true', async () => {
    const removeUserDto: RemoveUserDto = { id: 1 };
    const mockUser = { id: 1, name: 'Test User', supervisorId: null };

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockUserRepository.removeById.mockResolvedValue(mockUser.id);

    const result = await useCase.run(removeUserDto);

    expect(result).toEqual(true);
  });

  it('should throw NotFoundError if user does not exist', async () => {
    const removeUserDto: RemoveUserDto = { id: 1 };

    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.run(removeUserDto)).rejects.toThrow(NotFoundError);
    expect(userRepository.removeById).not.toHaveBeenCalled();
  });
});
