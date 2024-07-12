import { Injectable } from '@nestjs/common';
import { UserEntity } from './entity/user.entity';
import { UserRepository } from '../repository/user.repository';
import { NotFoundError } from './errors/NotFoundError';
import { AssignSupervisorDto } from './dto/AssignSupervisorDto';
import { HasCycle } from './errors/HasCycle';

@Injectable()
export class UserAssignSupervisorUseCase {
  constructor(private userRepository: UserRepository) {}

  async run(assignUserDto: AssignSupervisorDto): Promise<UserEntity> {
    const user = await this.userRepository.findById(assignUserDto.userId);

    const supervisorUser = await this.userRepository.findById(
      assignUserDto.supervisorId,
    );

    if (!supervisorUser || !user) {
      throw new NotFoundError();
    }

    const hasCycle = await this.hasCycle(
      assignUserDto.userId,
      assignUserDto.supervisorId,
    );

    if (hasCycle) {
      throw new HasCycle();
    }

    await this.userRepository.reassignSupervisorOfUser(
      user.id,
      supervisorUser.id,
    );

    return {
      id: user.id,
      name: user.name,
      supervisorId: supervisorUser.id,
    };
  }

  private async hasCycle(
    userId: number,
    newSupervisorId: number,
  ): Promise<boolean> {
    if (userId === newSupervisorId) {
      return true;
    }
    const user = await this.userRepository.findById(userId);
    let stack = [user];
    while (stack.length) {
      const employees = await this.userRepository.getDirectEmployeesOfUsers(
        stack.map((u) => u.id),
      );
      if (employees.map((e) => e.id).includes(newSupervisorId)) {
        return true;
      }
      stack = employees;
    }
    return false;
  }
}
