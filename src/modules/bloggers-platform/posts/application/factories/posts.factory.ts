import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Post, PostDocument, PostModelType } from '../../domain/posts.entity';
import { CreatePostDomainDto } from '../../dto/create-post.dto';

@Injectable()
export class PostsFactory {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}
  async create(dto: CreatePostDomainDto): Promise<PostDocument> {
    const post = this.createPostInstance(dto);
    return post;
  }

  private createPostInstance(dto: CreatePostDomainDto) {
    const post = this.PostModel.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: dto.blogName,
    });
    return post;
  }
}
