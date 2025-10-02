//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';
import { UpdateBlogDto } from '../../dto/create-blog.dto';

export class CreateBlogInputDto {
  name: string;
  description: string;
  websiteUrl: string;
}

export class UpdateBlogInputDto implements UpdateBlogDto {
  name: string;
  description: string;
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
