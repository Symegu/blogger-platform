import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/posts.entity';
import { PostsRepository } from '../infrastructure/posts.repository';
import { CreatePostDomainDto, UpdatePostDto } from '../dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postsRepository: PostsRepository,
  ) {}

  async createPost(dto: CreatePostDomainDto): Promise<string> {
    const post = this.PostModel.createInstance(dto);
    await this.postsRepository.save(post);
    return post._id.toString();
  }

  async updatePost(id: string, dto: UpdatePostDto): Promise<string> {
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.update(dto);
    await this.postsRepository.save(post);
    return post._id.toString();
  }

  async deletePost(id: string) {
    const post = await this.postsRepository.findOrNotFoundFail(id);
    post.makeDeleted();
    await this.postsRepository.save(post);
  }
}
