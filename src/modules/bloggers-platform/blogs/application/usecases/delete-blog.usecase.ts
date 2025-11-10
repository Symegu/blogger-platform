import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsSqlRepository } from '../../infrastructure/blogs-sql.repository';

export class DeleteBlogCommand {
  constructor(public blogId: number) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand, void> {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}
  async execute({ blogId }: DeleteBlogCommand): Promise<void> {
    const blog = await this.blogsSqlRepository.findOrNotFoundFail(blogId);
    await this.blogsSqlRepository.delete(blog.id);
  }
}
