//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
import { IsString, IsNotEmpty, IsEmail, MinLength, MaxLength } from 'class-validator';

import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';
import { UpdateUserDto } from '../../dto/create-user.dto';

export class CreateUserInputDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(10)
  login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export enum UsersSortBy {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}

export class UpdateUserInputDto implements UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

//dto для запроса списка юзеров с пагинацией, сортировкой, фильтрами

//наследуемся от класса BaseQueryParams, где уже есть pageNumber, pageSize и т.п., чтобы не дублировать эти свойства
export class GetUsersQueryParams extends BaseQueryParams {
  sortBy = UsersSortBy.CreatedAt;
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
}
