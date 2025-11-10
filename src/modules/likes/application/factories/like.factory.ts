import { Injectable } from '@nestjs/common';

import { LikeStatus } from '../../domain/like.entity';
import { CreateLikeData } from '../../dto/like.domain-dto';

@Injectable()
export class LikesFactory {
  create(
    userId: number,
    userLogin: string,
    entity: 'Post' | 'Comment',
    entityId: number,
    status: LikeStatus,
  ): CreateLikeData {
    return {
      user_id: userId,
      user_login: userLogin,
      entity,
      entity_id: entityId,
      status,
    };
  }
}
