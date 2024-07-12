import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../repository/user.repository';
import { CreateUserDto } from './dto/CreateUserDto';
import { UserEntity } from './entity/user.entity';
import { NotFoundError } from './errors/NotFoundError';
import { UserCreateUseCase } from './userCreate.use-case';

describe('UserCreateUseCase', () => {
  let useCase: UserCreateUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findById: jest.fn(),
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCreateUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    useCase = module.get<UserCreateUseCase>(UserCreateUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create user without supervisor', async () => {
    const createUserDto: CreateUserDto = { name: 'Test User' };
    const mockUser: UserEntity = {
      id: 1,
      name: 'Test User',
      supervisorId: null,
    };

    mockUserRepository.createUser.mockResolvedValue(mockUser);

    const result = await useCase.run(createUserDto);

    expect(result).toEqual(mockUser);
  });

  it('should create user with supervisor', async () => {
    const createUserDto: CreateUserDto = { name: 'Test User', supervisorId: 1 };
    const mockSupervisor: UserEntity = {
      id: 1,
      name: 'Supervisor',
      supervisorId: null,
    };
    const mockUser: UserEntity = { id: 2, name: 'Test User', supervisorId: 1 };

    mockUserRepository.findById.mockResolvedValue(mockSupervisor);
    mockUserRepository.createUser.mockResolvedValue(mockUser);

    const result = await useCase.run(createUserDto);

    expect(result).toEqual(mockUser);
  });

  it('should throw NotFoundError if supervisor does not exist', async () => {
    const createUserDto: CreateUserDto = { name: 'Test User', supervisorId: 1 };

    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.run(createUserDto)).rejects.toThrow(NotFoundError);
    expect(userRepository.createUser).not.toHaveBeenCalled();
  });
});
