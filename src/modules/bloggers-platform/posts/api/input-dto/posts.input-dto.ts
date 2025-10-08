//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
import { IsString, IsNotEmpty, MaxLength, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
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
  @IsMongoId()
  @IsNotEmpty()
  blogId: Types.ObjectId;
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
  @IsMongoId()
  @IsNotEmpty()
  blogId: Types.ObjectId;
}

export enum PostsSortBy {
  CreatedAt = 'createdAt',
  Title = 'title',
  BlogId = 'blogId',
}

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetPostsQueryParams extends BaseQueryParams {
  sortBy: PostsSortBy = PostsSortBy.CreatedAt;
  blogId?: Types.ObjectId;
}
