import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './service/entity/user.entity';
import { UserController } from './controller/user.controller';
import { UserCreateUseCase } from './service/userCreate.use-case';
import { UserRemoveUseCase } from './service/userRemove.use-case';
import { UserAssignSupervisorUseCase } from './service/userAssignSupervisor.use-case';
import { GetUserHierarchyUseCase } from './service/getUserHierarchy.use-case';
import { UserRepository } from './repository/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    UserCreateUseCase,
    UserRemoveUseCase,
    UserAssignSupervisorUseCase,
    GetUserHierarchyUseCase,
    UserRepository,
  ],
})
export class UserModule {}
