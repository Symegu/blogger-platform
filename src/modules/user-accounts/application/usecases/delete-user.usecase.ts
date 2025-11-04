import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersSqlRepository } from '../../infrastructure/users.sql-repository';

export class DeleteUserCommand {
  constructor(public id: number) {}
}
@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand, void> {
  constructor(private usersSqlRepository: UsersSqlRepository) {}

  async execute({ id }: DeleteUserCommand): Promise<void> {
    await this.usersSqlRepository.findOrNotFoundFail(id);
    await this.usersSqlRepository.delete(id);
    return;
  }
}
