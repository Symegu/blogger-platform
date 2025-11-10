import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateBlogInputDto } from '../../api/input-dto/blogs.input-dto';
import { BlogsSqlRepository } from '../../infrastructure/blogs-sql.repository';
import { BlogsFactory } from '../factories/blogs.factory';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogInputDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand, number> {
  constructor(
    private readonly blogsSqlRepository: BlogsSqlRepository,
    private blogsFactory: BlogsFactory,
  ) {}

  async execute({ dto }: CreateBlogCommand): Promise<number> {
    const blog = await this.blogsFactory.create(dto);
    return await this.blogsSqlRepository.create(blog);
  }
}
