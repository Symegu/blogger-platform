export class CreateBlogDomainDto {
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
}

export class CreateBlogDto {
  name: string;
  description: string;
  websiteUrl: string;
}

export class UpdateBlogDto {
  name: string;
  description: string;
  websiteUrl: string;
}
