// @Schema({ _id: false })
// export class CommentatorInfo {
//   @Prop({ type: Types.ObjectId, required: true })
//   userId: Types.ObjectId;

//   @Prop({ type: String, required: true })
//   userLogin: string;
// }
// export const CommentatorInfoSchema = SchemaFactory.createForClass(CommentatorInfo);

// @Schema({ _id: false })
// export class CommentLikesInfo {
//   @Prop({ type: Number, default: 0 })
//   likesCount: number;

//   @Prop({ type: Number, default: 0 })
//   dislikesCount: number;

//   @Prop({ type: String, enum: ['None', 'Like', 'Dislike'], default: 'None' })
//   myStatus: 'None' | 'Like' | 'Dislike';
// }
// export const CommentLikesInfoSchema = SchemaFactory.createForClass(CommentLikesInfo);

// @Schema({ timestamps: true, collection: 'comments' })
// export class Comment {
//   @Prop({ type: String, required: true, minlength: 20, maxlength: 300 })
//   content: string;

//   @Prop({ type: CommentatorInfoSchema, required: true })
//   commentatorInfo: CommentatorInfo;

//   @Prop({ type: Types.ObjectId, required: true })
//   postId: Types.ObjectId;

//   @Prop({ type: CommentLikesInfoSchema, default: () => ({}) })
//   likesInfo: CommentLikesInfo;

//   createdAt: Date;
//   updatedAt: Date;

//   @Prop({ type: Date, default: null })
//   deletedAt: Date | null;

//   // Статический метод для создания инстанса
//   static createInstance(dto: CreateCommentDomainDto): CommentDocument {
//     const comment = new this();
//     comment.content = dto.content;
//     comment.commentatorInfo = {
//       userId: dto.userId,
//       userLogin: dto.userLogin,
//     };
//     comment.postId = dto.postId;
//     comment.likesInfo = {
//       likesCount: 0,
//       dislikesCount: 0,
//       myStatus: 'None',
//     };

//     // comment.createdAt = new Date();
//     // comment.updatedAt = new Date();

//     return comment as CommentDocument;
//   }

//   update(dto: { content: string }) {
//     this.content = dto.content;
//     this.updatedAt = new Date();
//   }

//   makeDeleted() {
//     if (this.deletedAt !== null) {
//       throw new Error('Entity already deleted');
//     }
//     this.deletedAt = new Date();
//   }
// }

// export const CommentSchema = SchemaFactory.createForClass(Comment);
// CommentSchema.loadClass(Comment);
// export type CommentDocument = HydratedDocument<Comment>;
// export type CommentModelType = Model<CommentDocument> & typeof Comment;

export interface CommentData {
  id: number;
  post_id: number;
  user_id: number;
  user_login: string;
  content: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  likes_count: number;
  dislikes_count: number;
}

export interface CommentDataWithLikes {
  id: number;
  content: string;
  created_at: Date;
  user_id: number;
  user_login: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: 'None' | 'Like' | 'Dislike';
  };
}
