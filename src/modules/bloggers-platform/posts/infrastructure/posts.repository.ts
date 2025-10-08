import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';

import { Post, PostDocument, PostModelType } from '../domain/posts.entity';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async findById(id: Types.ObjectId): Promise<PostDocument | null> {
    return this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(post: PostDocument) {
    await post.save();
  }
  async findOrNotFoundFail(id: Types.ObjectId): Promise<PostDocument> {
    const post = await this.findById(id);
    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    return post;
  }
}
