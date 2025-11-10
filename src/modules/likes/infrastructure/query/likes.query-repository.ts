// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Types } from 'mongoose';

// import { Like, LikeModelType, LikeableEntity, LikeStatus } from '../../domain/like.entity';

// @Injectable()
// export class LikesQueryRepository {
//   constructor(
//     @InjectModel(Like.name)
//     private LikeModel: LikeModelType,
//   ) {}

//   async calculateMyStatus(
//     userId: Types.ObjectId | null,
//     entityId: Types.ObjectId,
//     entity: LikeableEntity,
//   ): Promise<LikeStatus.None | LikeStatus.Like | LikeStatus.Dislike> {
//     if (!userId) return LikeStatus.None;
//     const like = await this.LikeModel.findOne({ userId, entityId, entity: entity }).exec();
//     if (!like) return LikeStatus.None;
//     console.log('like.status', like);

//     return like.status;
//   }
// }
