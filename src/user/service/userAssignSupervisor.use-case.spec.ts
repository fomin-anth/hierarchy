import { Test, TestingModule } from '@nestjs/testing';
import { UserAssignSupervisorUseCase } from './userAssignSupervisor.use-case';
import { UserRepository } from '../repository/user.repository';
import { UserEntity } from './entity/user.entity';
import { AssignSupervisorDto } from './dto/AssignSupervisorDto';
import { NotFoundError } from './errors/NotFoundError';
import { HasCycle } from './errors/HasCycle';

describe('UserAssignSupervisorUseCase', () => {
  let useCase: UserAssignSupervisorUseCase;

  const mockUserRepository = {
    findById: jest.fn(),
    reassignSupervisorOfUser: jest.fn(),
    getDirectEmployeesOfUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAssignSupervisorUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<UserAssignSupervisorUseCase>(
      UserAssignSupervisorUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should assign supervisor correctly', async () => {
    const user: UserEntity = { id: 1, name: 'John', supervisorId: null };
    const supervisor: UserEntity = { id: 2, name: 'Jane', supervisorId: null };
    const assignedSupervisorUser: UserEntity = {
      id: 1,
      name: 'Jane',
      supervisorId: 2,
    };
    const assignSupervisorDto: AssignSupervisorDto = {
      userId: user.id,
      supervisorId: supervisor.id,
    };

    mockUserRepository.findById
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(supervisor)
      .mockResolvedValueOnce(user);
    mockUserRepository.getDirectEmployeesOfUsers.mockResolvedValue([]);
    mockUserRepository.reassignSupervisorOfUser.mockResolvedValue(
      assignedSupervisorUser,
    );

    const result = await useCase.run(assignSupervisorDto);

    expect(result).toEqual({
      id: user.id,
      name: user.name,
      supervisorId: supervisor.id,
    });
    expect(mockUserRepository.reassignSupervisorOfUser).toHaveBeenCalledWith(
      user.id,
      supervisor.id,
    );
  });

  it('should throw NotFoundError if user or supervisor is not found', async () => {
    const assignSupervisorDto: AssignSupervisorDto = {
      userId: 1,
      supervisorId: 2,
    };

    mockUserRepository.findById.mockResolvedValueOnce(null);

    await expect(useCase.run(assignSupervisorDto)).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should throw HasCycle if assigning supervisor creates a cycle', async () => {
    const user: UserEntity = { id: 1, name: 'John', supervisorId: null };
    const supervisor: UserEntity = { id: 2, name: 'Jane', supervisorId: 1 };
    const assignSupervisorDto: AssignSupervisorDto = {
      userId: user.id,
      supervisorId: supervisor.id,
    };

    mockUserRepository.findById
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(supervisor)
      .mockResolvedValueOnce(user);
    mockUserRepository.getDirectEmployeesOfUsers.mockResolvedValue([
      supervisor,
    ]);

    await expect(useCase.run(assignSupervisorDto)).rejects.toThrow(HasCycle);
  });

  it('should throw HasCycle if assigning supervisor creates a cycle with more deep', async () => {
    const user: UserEntity = { id: 1, name: 'John', supervisorId: null };
    const user1: UserEntity = { id: 2, name: 'John', supervisorId: 1 };
    const user2: UserEntity = { id: 3, name: 'John', supervisorId: 1 };
    const user3: UserEntity = { id: 4, name: 'John', supervisorId: 3 };
    const user4: UserEntity = { id: 5, name: 'John', supervisorId: 3 };
    const user5: UserEntity = { id: 6, name: 'John', supervisorId: 3 };
    const user6: UserEntity = { id: 7, name: 'John', supervisorId: 6 };
    const supervisor: UserEntity = { id: 8, name: 'Jane', supervisorId: 7 };
    const assignSupervisorDto: AssignSupervisorDto = {
      userId: user.id,
      supervisorId: supervisor.id,
    };

    mockUserRepository.findById
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(supervisor)
      .mockResolvedValueOnce(user);
    mockUserRepository.getDirectEmployeesOfUsers
      .mockResolvedValueOnce([user1, user2])
      .mockResolvedValueOnce([user1, user2])
      .mockResolvedValueOnce([user3, user4, user5])
      .mockResolvedValueOnce([user6])
      .mockResolvedValueOnce([supervisor]);

    await expect(useCase.run(assignSupervisorDto)).rejects.toThrow(HasCycle);
  });
});
