import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/CreateUserDto';
import { HttpUserDto } from './dto/HttpUserDto';
import { AssignSupervisorDto } from './dto/AssignSupervisorDto';
import { NotFoundError } from '../service/errors/NotFoundError';
import { UserCreateUseCase } from '../service/userCreate.use-case';
import { UserRemoveUseCase } from '../service/userRemove.use-case';
import { UserAssignSupervisorUseCase } from '../service/userAssignSupervisor.use-case';
import { GetUserHierarchyUseCase } from '../service/getUserHierarchy.use-case';

@Controller('user')
export class UserController {
  constructor(
    private createUserUseCase: UserCreateUseCase,
    private removeUserUseCase: UserRemoveUseCase,
    private assignSupervisorUseCase: UserAssignSupervisorUseCase,
    private getUserHierarchyUseCase: GetUserHierarchyUseCase,
  ) {}

  @Patch(':userId/supervisor')
  async assignSupervisor(
    @Param('userId') userId: number,
    @Body() assignSupervisorDto: AssignSupervisorDto,
  ) {
    try {
      await this.assignSupervisorUseCase.run({
        userId: userId,
        supervisorId: assignSupervisorDto.supervisorId,
      });
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundError) {
        throw new NotFoundException();
      }
      throw new InternalServerErrorException();
    }
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<HttpUserDto> {
    try {
      const user = await this.createUserUseCase.run({
        supervisorId: createUserDto.supervisorId,
        name: createUserDto.name,
      });
      console.log(user);
      return {
        name: user.name,
        id: user.id,
        supervisorId: user.supervisorId,
      };
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundError) {
        throw new NotFoundException();
      }
      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  async removeUser(@Param('id') id: number) {
    try {
      await this.removeUserUseCase.run({ id });
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException();
    }
  }

  @Get('hierarchy')
  async getHierarchy() {
    try {
      const { users } = await this.getUserHierarchyUseCase.run();
      return {
        users,
      };
    } catch (error) {
      Logger.error(error);
      if (error instanceof NotFoundError) {
        throw new NotFoundException();
      }
      throw new InternalServerErrorException();
    }
  }
}
