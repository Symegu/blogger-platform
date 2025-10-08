import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectIdValidationTransformationPipe } from 'src/core/pipes/objectid-validation.pipe';

import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { BlogsController } from './blogs/api/blogs.controller';
// import { BlogsService } from './blogs/application/blogs.service';
import { BlogsFactory } from './blogs/application/factories/blogs.factory';
import { GetAllBlogsQueryHandler } from './blogs/application/queries/get-all-blogs.query';
import { GetBlogByIdQueryHandler } from './blogs/application/queries/get-blog-by-id.query';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog.usecase';
import { DeleteBlogUseCase } from './blogs/application/usecases/delete-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/usecases/update-blog.usecase';
import { Blog, BlogSchema } from './blogs/domain/blogs.entity';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query.repository';
import { PostsController } from './posts/api/posts.controller';
import { PostsFactory } from './posts/application/factories/posts.factory';
// import { PostsService } from './posts/application/posts.service';
import { GetAllPostsQueryHandler } from './posts/application/queries/get-all-posts.query';
import { GetPostByIdQueryHandler } from './posts/application/queries/get-post-by-id.query';
import { CreatePostUseCase } from './posts/application/usecases/create-post.usecase';
import { DeletePostUseCase } from './posts/application/usecases/delete-post.usecase';
import { UpdatePostUseCase } from './posts/application/usecases/update-post.usecase';
import { Post, PostSchema } from './posts/domain/posts.entity';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';

const commandHandlers = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
];

const queryHandlers = [
  GetAllBlogsQueryHandler,
  GetBlogByIdQueryHandler,
  GetPostByIdQueryHandler,
  GetAllPostsQueryHandler,
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    UserAccountsModule,
  ],
  controllers: [BlogsController, PostsController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    // BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    // PostsService,
    PostsRepository,
    PostsQueryRepository,
    BlogsFactory,
    PostsFactory,
    ObjectIdValidationTransformationPipe,
  ],
  exports: [],
})
export class BloggersPlatformModule {}
