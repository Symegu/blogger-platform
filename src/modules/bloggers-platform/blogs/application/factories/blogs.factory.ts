import { Injectable } from '@nestjs/common';

import { CreateBlogData, CreateBlogDto } from '../../dto/create-blog.dto';

@Injectable()
export class BlogsFactory {
  constructor() {}

  async create(dto: CreateBlogDto): Promise<CreateBlogData> {
    return {
      name: dto.name,
      description: dto.description,
      website_url: dto.websiteUrl,
      is_membership: false,
    };
  }
}
