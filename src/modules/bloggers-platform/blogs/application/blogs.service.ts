import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blogs.entity';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreateBlogDto, UpdateBlogDto } from '../dto/create-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
  ) {}
  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blog = this.BlogModel.createInstance({ ...dto, isMembership: false });
    await this.blogsRepository.save(blog);
    return blog._id.toString();
  }
  async updateBlog(id: string, dto: UpdateBlogDto): Promise<string> {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);
    blog.update(dto);
    await this.blogsRepository.save(blog);
    return blog._id.toString();
  }
  async deleteBlog(id: string) {
    const blog = await this.blogsRepository.findOrNotFoundFail(id);
    blog.makeDeleted();
    await this.blogsRepository.save(blog);
  }
}
