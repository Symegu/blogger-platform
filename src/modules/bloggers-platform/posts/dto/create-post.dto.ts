export class CreatePostData {
  title: string;
  short_description: string;
  content: string;
  blog_id: number;
  blog_name: string;
}

export class CreatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
}

export class UpdatePostData {
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
}
