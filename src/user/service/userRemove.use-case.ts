import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { RemoveUserDto } from './dto/RemoveUserDto';
import { NotFoundError } from './errors/NotFoundError';

@Injectable()
export class UserRemoveUseCase {
  constructor(private userRepository: UserRepository) {}

  async run(removeUserDto: RemoveUserDto): Promise<boolean> {
    const userToRemove = await this.userRepository.findById(removeUserDto.id);
    if (!userToRemove) {
      throw new NotFoundError();
    }

    await this.userRepository.reassignUsersSupervisorWith(
      userToRemove.id,
      userToRemove.supervisorId,
    );

    await this.userRepository.removeById(removeUserDto.id);

    return true;
  }
}
