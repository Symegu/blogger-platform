import { Injectable } from '@nestjs/common';

import { CreatePostData, CreatePostDto } from '../../dto/create-post.dto';

@Injectable()
export class PostsFactory {
  constructor() {}
  async create(dto: CreatePostDto, blogName: string): Promise<CreatePostData> {
    return {
      title: dto.title,
      short_description: dto.shortDescription,
      content: dto.content,
      blog_id: dto.blogId,
      blog_name: blogName,
    };
  }
}
