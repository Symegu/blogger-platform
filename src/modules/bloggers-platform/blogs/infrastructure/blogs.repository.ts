import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../domain/blogs.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(blog: BlogDocument) {
    await blog.save();
  }

  async findOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.findById(id);

    if (!blog) {
      //TODO: replace with domain exception
      throw new NotFoundException('user not found');
    }

    return blog;
  }
}
