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
import { LikesRepository } from '../likes/infrastructure/likes.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query.repository';
import { GetAllCommentsQueryHandler } from './comments/application/queries/get-all-comments.query';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment.usecase';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
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
import { LikesFactory } from '../likes/application/factories/like.factory';
import { SetLikeStatusUseCase } from '../likes/application/set-like-status.usecase';
import { CommentsFactory } from './comments/application/factories/comments.factory';
import { Comment, CommentSchema } from './comments/domain/comments.entity';
import { Like, LikeSchema } from '../likes/domain/like.entity';
import { CommentsController } from './comments/api/comments.controller';
import { GetCommentByIdQueryHandler } from './comments/application/queries/get-comment-by-id.query';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments.query-repository';
import { LikesQueryRepository } from '../likes/infrastructure/query/likes.query-repository';

const commandHandlers = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  SetLikeStatusUseCase,
];

const queryHandlers = [
  GetAllBlogsQueryHandler,
  GetBlogByIdQueryHandler,
  GetPostByIdQueryHandler,
  GetAllPostsQueryHandler,
  GetCommentByIdQueryHandler,
  GetAllCommentsQueryHandler,
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    UserAccountsModule,
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    // BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    // PostsService,
    PostsRepository,
    PostsQueryRepository,
    CommentsRepository,
    CommentsQueryRepository,
    LikesRepository,
    LikesQueryRepository,
    BlogsFactory,
    PostsFactory,
    CommentsFactory,
    LikesFactory,
    ObjectIdValidationTransformationPipe,
  ],
  exports: [],
})
export class BloggersPlatformModule {}
