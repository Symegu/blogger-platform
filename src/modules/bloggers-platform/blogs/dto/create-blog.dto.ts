import { IsBoolean, IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';

import { Trim } from '../../../../core/decorators/transform/trim';

export class CreateBlogDomainDto {
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
  @IsBoolean()
  @IsNotEmpty()
  isMembership: boolean;
}

export class CreateBlogDto {
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

export class UpdateBlogInputDto {
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

export interface CreateBlogData {
  name: string;
  description: string;
  website_url: string;
  is_membership: boolean;
}
