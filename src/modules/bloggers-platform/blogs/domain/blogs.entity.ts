// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Error, HydratedDocument, Model } from 'mongoose';

// import { CreateBlogDomainDto, UpdateBlogInputDto } from '../dto/create-blog.dto';

// @Schema({ timestamps: true })
// export class Blog {
//   @Prop({ type: String, required: true })
//   name: string;

//   @Prop({ type: String, required: true })
//   description: string;

//   @Prop({ type: String, required: true })
//   websiteUrl: string;

//   @Prop({ type: Boolean, required: true, default: false })
//   isMembership: boolean;

//   createdAt: Date;
//   updatedAt: Date;

//   @Prop({ type: Date, default: null })
//   deletedAt: Date | null;

//   // get id() {
//   //   // @ts-ignore
//   //   return this._id.toString();
//   // }

//   static createInstance(dto: CreateBlogDomainDto): BlogDocument {
//     const blog = new this();
//     blog.name = dto.name;
//     blog.description = dto.description;
//     blog.websiteUrl = dto.websiteUrl;
//     blog.isMembership = false;

//     return blog as BlogDocument;
//   }

//   makeDeleted() {
//     console.log('makeDeleted called, deletedAt =', this.deletedAt);
//     if (this.deletedAt !== null) {
//       throw new Error('Entity already deleted');
//     }
//     this.deletedAt = new Date();
//   }

//   update(dto: UpdateBlogInputDto) {
//     this.name = dto.name;
//     this.description = dto.description;
//     this.websiteUrl = dto.websiteUrl;
//   }
// }

// export const BlogSchema = SchemaFactory.createForClass(Blog);
// BlogSchema.loadClass(Blog);
// export type BlogDocument = HydratedDocument<Blog>;
// export type BlogModelType = Model<BlogDocument> & typeof Blog;

export interface BlogData {
  id: number;
  name: string;
  description: string;
  website_url: string;
  is_membership: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
