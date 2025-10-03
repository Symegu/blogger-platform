//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { UpdatePostDto } from '../../dto/create-post.dto';

export class CreatePostInputDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export class UpdatePostInputDto implements UpdatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export enum PostsSortBy {
  CreatedAt = 'createdAt',
  Title = 'title',
  BlogId = 'blogId',
}

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetPostsQueryParams extends BaseQueryParams {
  sortBy: PostsSortBy = PostsSortBy.CreatedAt;
  blogId?: string;
}
