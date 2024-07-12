import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/CreateUserDto';
import { UserEntity } from './entity/user.entity';
import { UserRepository } from '../repository/user.repository';
import { NotFoundError } from './errors/NotFoundError';
import { isNumber } from '@nestjs/common/utils/shared.utils';

@Injectable()
export class UserCreateUseCase {
  constructor(private userRepository: UserRepository) {}

  async run(createUserDto: CreateUserDto): Promise<UserEntity> {
    const newUserData: CreateUserDto = {
      name: createUserDto.name,
    };

    if (typeof createUserDto.supervisorId === 'number') {
      const supervisorUser = await this.userRepository.findById(
        createUserDto.supervisorId,
      );

      if (!supervisorUser) {
        throw new NotFoundError();
      }
      newUserData.supervisorId = createUserDto.supervisorId;
    }

    const newUser = await this.userRepository.createUser(newUserData);

    return {
      id: newUser.id,
      name: newUser.name,
      supervisorId: newUser.supervisorId,
    };
  }
}
