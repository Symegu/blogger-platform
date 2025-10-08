import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Blog, BlogDocument, BlogModelType } from '../../domain/blogs.entity';
import { CreateBlogDto } from '../../dto/create-blog.dto';

@Injectable()
export class BlogsFactory {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async create(dto: CreateBlogDto): Promise<BlogDocument> {
    const blog = this.createBlogInstance(dto);
    return blog;
  }

  private createBlogInstance(dto: CreateBlogDto) {
    const blog = this.BlogModel.createInstance({
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      isMembership: false,
    });
    return blog;
  }
}
