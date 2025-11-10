//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
import { IsString, IsNotEmpty, MaxLength, IsNumber } from 'class-validator';
import { Trim } from 'src/core/decorators/transform/trim';

import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';

export class CreatePostInputDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  title: string;
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
  @IsNumber()
  @IsNotEmpty()
  blogId: number;
}

export class CreatePostForBlogInputDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  title: string;
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}

export class UpdatePostInputDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  title: string;
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  shortDescription: string;
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
  blogId?: number;
}

export enum PostsSortBy {
  CreatedAt = 'created_at',
  Title = 'title',
  BlogId = 'blog_id',
  BlogName = 'blog_name',
}

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetPostsQueryParams extends BaseQueryParams {
  sortBy: PostsSortBy = PostsSortBy.CreatedAt;
  blogId?: number;
}
