import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';

import { UpdateBlogInputDto } from '../../dto/create-blog.dto';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class UpdateBlogCommand {
  constructor(
    public dto: UpdateBlogInputDto,
    public blogId: Types.ObjectId,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand, void> {
  constructor(private readonly blogsRepository: BlogsRepository) {}
  async execute({ dto, blogId }: UpdateBlogCommand): Promise<void> {
    const blog = await this.blogsRepository.findOrNotFoundFail(blogId);

    blog.update(dto);
    await this.blogsRepository.save(blog);
  }
}
