import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';

import { PostsRepository } from '../../infrastructure/posts.repository';

export class DeletePostCommand {
  constructor(public postId: Types.ObjectId) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private postsRepository: PostsRepository) {}
  async execute({ postId }: DeletePostCommand): Promise<void> {
    const post = await this.postsRepository.findOrNotFoundFail(postId);
    await post.makeDeleted();
    await this.postsRepository.save(post);
    return;
  }
}
