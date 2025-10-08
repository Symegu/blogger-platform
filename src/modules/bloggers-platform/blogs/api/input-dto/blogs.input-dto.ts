//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

import { Trim } from '../../../../../core/decorators/transform/trim';
import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';

export class CreateBlogInputDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  name: string;
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;
  @Trim()
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}

export enum BlogsSortBy {
  CreatedAt = 'createdAt',
  Name = 'name',
}

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetBlogsQueryParams extends BaseQueryParams {
  sortBy = BlogsSortBy.CreatedAt;
  searchNameTerm: string | null = null;
}
