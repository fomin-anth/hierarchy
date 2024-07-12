import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/CreateUserDto';
import { RepoUserDto } from './dto/RepoUserDto';
import { In, Repository } from 'typeorm';
import { UserEntity } from '../service/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity) private repository: Repository<UserEntity>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<RepoUserDto> {
    const { raw: users } = await this.repository
      .createQueryBuilder()
      .insert()
      .into(UserEntity)
      .values({
        name: createUserDto.name,
        supervisorId: createUserDto.supervisorId,
      })
      .returning('*')
      .execute();
    const user = users[0];

    return {
      id: user.id,
      name: user.name,
      supervisorId: user.supervisorId,
    };
  }

  async findById(id: number): Promise<RepoUserDto | null> {
    const user = await this.repository.findOneBy({
      id,
    });
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      name: user.name,
      supervisorId: user.supervisorId,
    };
  }

  async removeById(id: number) {
    await this.repository.delete(id);
  }

  async reassignUsersSupervisorWith(
    oldSupervisorId: number,
    newSupervisorId?: number,
  ) {
    await this.repository
      .createQueryBuilder()
      .update(UserEntity)
      .set({ supervisorId: newSupervisorId })
      .where({ supervisorId: oldSupervisorId })
      .execute();
  }

  async reassignSupervisorOfUser(
    userId: number,
    newSupervisor: number,
  ): Promise<RepoUserDto> {
    const { raw: user } = await this.repository.update(userId, {
      supervisorId: newSupervisor,
    });
    return {
      id: user.id,
      name: user.name,
      supervisorId: user.supervisorId,
    };
  }

  async getDirectEmployeesOfUsers(userIds: number[]): Promise<RepoUserDto[]> {
    const res = await this.repository.find({
      where: { supervisorId: In(userIds) },
    });
    return res.map((entity) => ({
      id: entity.id,
      name: entity.name,
      supervisorId: entity.supervisorId,
    }));
  }

  async getHierarchy(): Promise<RepoUserDto[]> {
    const res = await this.repository.find();
    return res.map((entity) => ({
      id: entity.id,
      name: entity.name,
      supervisorId: entity.supervisorId,
    }));
  }
}
