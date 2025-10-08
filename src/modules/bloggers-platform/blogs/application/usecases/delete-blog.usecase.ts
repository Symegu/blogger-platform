import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';

import { BlogsRepository } from '../../infrastructure/blogs.repository';
export class DeleteBlogCommand {
  constructor(public blogId: Types.ObjectId) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand, void> {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async execute({ blogId }: DeleteBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findOrNotFoundFail(blogId);
    blog.makeDeleted();
    await this.blogsRepository.save(blog);
  }
}
