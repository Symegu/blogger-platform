import { Types } from 'mongoose';

export class CreatePostDomainDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: Types.ObjectId;
  blogName: string;
}

export class CreatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: Types.ObjectId;
}

export class UpdatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: Types.ObjectId;
}
