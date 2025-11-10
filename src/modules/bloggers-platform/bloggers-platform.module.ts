import { Module } from '@nestjs/common';
import { ObjectIdValidationTransformationPipe } from 'src/core/pipes/objectid-validation.pipe';

import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { BlogsController, BlogsSaController } from './blogs/api/blogs.controller';
import { BlogsFactory } from './blogs/application/factories/blogs.factory';
import { GetAllBlogsQueryHandler } from './blogs/application/queries/get-all-blogs.query';
import { GetBlogByIdQueryHandler } from './blogs/application/queries/get-blog-by-id.query';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog.usecase';
import { DeleteBlogUseCase } from './blogs/application/usecases/delete-blog.usecase';
import { UpdateBlogUseCase } from './blogs/application/usecases/update-blog.usecase';
import { BlogsSqlRepository } from './blogs/infrastructure/blogs-sql.repository';
import { LikesService } from '../likes/application/likes.service';
import { LikesSqlRepository } from '../likes/infrastructure/likes-sql.repository';
import { BlogsSqlQueryRepository } from './blogs/infrastructure/query/blogs-sql.query-repository';
import { CommentsController } from './comments/api/comments.controller';
import { GetAllCommentsQueryHandler } from './comments/application/queries/get-all-comments.query';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment.usecase';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { CommentsSqlRepository } from './comments/infrastructure/comments-sql.repository';
import { PostsController, PostsSaController } from './posts/api/posts.controller';
import { PostsFactory } from './posts/application/factories/posts.factory';
import { GetAllPostsQueryHandler } from './posts/application/queries/get-all-posts.query';
import { GetPostByIdQueryHandler } from './posts/application/queries/get-post-by-id.query';
import { CreatePostUseCase } from './posts/application/usecases/create-post.usecase';
import { DeletePostUseCase } from './posts/application/usecases/delete-post.usecase';
import { UpdatePostUseCase } from './posts/application/usecases/update-post.usecase';
import { LikesFactory } from '../likes/application/factories/like.factory';
import { SetLikeStatusUseCase } from '../likes/application/set-like-status.usecase';
import { CommentsFactory } from './comments/application/factories/comments.factory';
import { GetCommentByIdQueryHandler } from './comments/application/queries/get-comment-by-id.query';
import { CommentsSqlQueryRepository } from './comments/infrastructure/query/comments-sql.query-repository';
import { PostsSqlRepository } from './posts/infrastructure/posts-sql.repository';
import { PostsSqlQueryRepository } from './posts/infrastructure/query/posts-sql.query-repository';
import { LikesSqlQueryRepository } from '../likes/infrastructure/query/likes-sql.query-repository';

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
  imports: [UserAccountsModule],
  controllers: [
    BlogsController,
    BlogsSaController,
    PostsController,
    PostsSaController,
    CommentsController,
  ],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    BlogsSqlRepository,
    BlogsSqlQueryRepository,
    PostsSqlRepository,
    PostsSqlQueryRepository,
    CommentsSqlRepository,
    CommentsSqlQueryRepository,
    LikesService,
    LikesSqlRepository,
    LikesSqlQueryRepository,
    BlogsFactory,
    PostsFactory,
    CommentsFactory,
    LikesFactory,
    ObjectIdValidationTransformationPipe,
  ],
  exports: [],
})
export class BloggersPlatformModule {}
