import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { HierarchyDto } from './dto/HierarchyDto';

@Injectable()
export class GetUserHierarchyUseCase {
  constructor(private userRepository: UserRepository) {}

  async run(): Promise<HierarchyDto> {
    const users = await this.userRepository.getHierarchy();
    return {
      users,
    };
  }
}
