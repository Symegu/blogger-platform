import { Types } from 'mongoose';

import { LikeableEntity, LikeStatus } from '../domain/like.entity';

export type CreateLikeDomainDto = {
  userId: Types.ObjectId;
  userLogin: string;
  entity: LikeableEntity;
  entityId: Types.ObjectId;
  status: LikeStatus;
};
