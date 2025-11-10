import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UpdateBlogInputDto } from '../../dto/create-blog.dto';
import { BlogsSqlRepository } from '../../infrastructure/blogs-sql.repository';

export class UpdateBlogCommand {
  constructor(
    public dto: UpdateBlogInputDto,
    public blogId: number,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand, void> {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}
  async execute({ dto, blogId }: UpdateBlogCommand): Promise<void> {
    await this.blogsSqlRepository.findOrNotFoundFail(blogId);
    await this.blogsSqlRepository.update(blogId, {
      name: dto.name,
      website_url: dto.websiteUrl,
      description: dto.description,
      is_membership: false,
    });
    return;
  }
}
