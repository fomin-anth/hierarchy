import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../repository/user.repository';
import { GetUserHierarchyUseCase } from './getUserHierarchy.use-case';
import { RepoUserDto } from '../repository/dto/RepoUserDto';

describe('GetUserHierarchyUseCase', () => {
  let useCase: GetUserHierarchyUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    getHierarchy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserHierarchyUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<GetUserHierarchyUseCase>(GetUserHierarchyUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the user hierarchy', async () => {
    const mockHierarchy: RepoUserDto[] = [
      { id: 1, name: 'User 1', supervisorId: null },
      { id: 2, name: 'User 2', supervisorId: 1 },
    ];

    mockUserRepository.getHierarchy.mockResolvedValue(mockHierarchy);

    const result = await useCase.run();

    expect(result).toEqual({
      users: mockHierarchy,
    });
    expect(userRepository.getHierarchy).toHaveBeenCalledTimes(1);
  });
});
