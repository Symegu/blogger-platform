import { LikeableEntity, LikeStatus } from '../domain/like.entity';

export type CreateLikeData = {
  user_id: number;
  user_login: string;
  entity: LikeableEntity;
  entity_id: number;
  status: LikeStatus;
};
