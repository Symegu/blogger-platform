export class CreatePostDomainDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
}

export class CreatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export class UpdatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}
