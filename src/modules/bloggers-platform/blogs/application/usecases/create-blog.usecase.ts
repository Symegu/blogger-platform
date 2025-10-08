import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateBlogInputDto } from '../../api/input-dto/blogs.input-dto';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { BlogsFactory } from '../factories/blogs.factory';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogInputDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand, BlogViewDto> {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private blogsFactory: BlogsFactory,
  ) {}

  async execute({ dto }: CreateBlogCommand): Promise<BlogViewDto> {
    const blog = await this.blogsFactory.create(dto);
    await this.blogsRepository.save(blog);
    return BlogViewDto.mapToView(blog);
  }
}
