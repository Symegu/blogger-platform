// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Error, HydratedDocument, Model, Types } from 'mongoose';

import { LikeDetailsViewDto } from 'src/modules/likes/api/view-dto/like.view-dto';

// import { CreatePostDomainDto, UpdatePostDto } from '../dto/create-post.dto';
// import { LikeStatus } from 'src/modules/likes/domain/like.entity';

// @Schema({ timestamps: true })
// export class Post {
//   @Prop({ type: String, required: true })
//   title: string;

//   @Prop({ type: String, required: true })
//   shortDescription: string;

//   @Prop({ type: String, required: true })
//   content: string;

//   @Prop({ type: Types.ObjectId, required: true })
//   blogId: Types.ObjectId;

//   @Prop({ type: String, required: true })
//   blogName: string;

//   createdAt: Date;
//   updatedAt: Date;

//   @Prop({ type: Date, default: null })
//   deletedAt: Date | null;

//   @Prop({
//     type: Object,
//     default: {
//       likesCount: 0,
//       dislikesCount: 0,
//       myStatus: 'None',
//       newestLikes: [],
//     },
//   })
//   extendedLikesInfo: {
//     likesCount: number;
//     dislikesCount: number;
//     myStatus: LikeStatus.None | LikeStatus.Like | LikeStatus.Dislike;
//     newestLikes: any[];
//   };

//   // Для тестов: myStatus = 'None' | 'Like' | 'Dislike', вычисляемый динамически
//   // Мы сделаем его виртуальным
//   myStatus?: LikeStatus.None | LikeStatus.Like | LikeStatus.Dislike;
//   // get id() {
//   //   // @ts-ignore
//   //   return this._id.toString();
//   // }

//   static createInstance(dto: CreatePostDomainDto): PostDocument {
//     const post = new this();
//     post.title = dto.title;
//     post.shortDescription = dto.shortDescription;
//     post.content = dto.content;
//     post.blogId = dto.blogId;
//     post.blogName = dto.blogName;
//     post.extendedLikesInfo = {
//       likesCount: 0,
//       dislikesCount: 0,
//       myStatus: LikeStatus.None,
//       newestLikes: [],
//     };
//     return post as PostDocument;
//   }

//   makeDeleted() {
//     if (this.deletedAt !== null) {
//       throw new Error('Entity already deleted');
//     }
//     this.deletedAt = new Date();
//   }

//   update(dto: UpdatePostDto) {
//     this.title = dto.title;
//     this.shortDescription = dto.shortDescription;
//     this.content = dto.content;
//     this.blogId = dto.blogId;
//   }
// }

// export const PostSchema = SchemaFactory.createForClass(Post);
// PostSchema.loadClass(Post);
// export type PostDocument = HydratedDocument<Post>;
// export type PostModelType = Model<PostDocument> & typeof Post;

export interface PostData {
  id: number;
  blog_id: number;
  blog_name: string;
  title: string;
  short_description: string;
  content: string;
  created_at: Date;
  likes_count: number;
  dislikes_count: number;
}

export interface PostDataWithLikes {
  id: number;
  blog_id: number;
  blog_name: string;
  title: string;
  short_description: string;
  content: string;
  created_at: Date;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: 'None' | 'Like' | 'Dislike';
    newestLikes: LikeDetailsViewDto[];
  };
}
