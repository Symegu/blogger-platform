import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostsSqlRepository } from '../../infrastructure/posts-sql.repository';

export class DeletePostCommand {
  constructor(public postId: number) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private postsSqlRepository: PostsSqlRepository) {}
  async execute({ postId }: DeletePostCommand): Promise<void> {
    await this.postsSqlRepository.findOrNotFoundFail(postId);
    await this.postsSqlRepository.delete(postId);
    return;
  }
}
