import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBasicAuth, ApiParam } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';

import { GetUsersQueryParams, CreateUserInputDto } from './input-dto/users.input-dto';
import { UserViewDto } from './view-dto/users.view-dto';
import { GetAllUsersQuery } from '../application/queries/get-all-users.query';
import { GetUserByIdQuery } from '../application/queries/get-user-by-id.query';
import { CreateUserCommand } from '../application/usecases/create-user.usecase';
import { DeleteUserCommand } from '../application/usecases/delete-user.usecase';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';

@Controller('users')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basicAuth')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    console.log('Users controller created');
  }

  // @ApiParam({ name: 'id' }) //для сваггера
  // @Get(':id')
  // async getById(@Param('id') id: Types.ObjectId): Promise<UserViewDto> {
  //   return this.queryBus.execute(new GetUserByIdQuery(id));
  // }

  @Get()
  async getAll(@Query() query: GetUsersQueryParams): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.queryBus.execute(new GetAllUsersQuery(query));
  }

  @Post()
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const userId = await this.commandBus.execute<CreateUserCommand, Types.ObjectId>(
      new CreateUserCommand(body),
    );
    return this.queryBus.execute(new GetUserByIdQuery(userId));
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: Types.ObjectId): Promise<void> {
    return await this.commandBus.execute<DeleteUserCommand, void>(new DeleteUserCommand(id));
  }

  //  @Put(':id')
  // async updateUser(
  //   @Param('id') id: Types.ObjectId,
  //   @Body() body: UpdateUserInputDto,
  // ): Promise<UserViewDto> {
  //   const userId = await this.usersService.updateUser(id, body);

  //   return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
  // }
}
