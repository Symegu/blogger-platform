import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { SessionDocument, Session, SessionModelType } from '../../domain/session.entity';
import { RefreshTokenPayloadDto } from '../../dto/payload.dto';
import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
import { SessionViewDto } from '../../api/view-dto/session.view-dto';

@Injectable()
export class SessionsQueryRepository {
  constructor(@InjectModel(Session.name) private SessionModel: SessionModelType) {}

  async findByDeviceId(deviceId: string): Promise<SessionDocument | null> {
    return this.SessionModel.findOne({ deviceId: new Types.ObjectId(deviceId) }).exec();
  }
  async findByUserId(userId: Types.ObjectId): Promise<SessionViewDto[]> {
    const sessions = await this.SessionModel.find({ userId: new Types.ObjectId(userId) })
      .sort({ lastActiveDate: -1 })
      .exec();
    return sessions.map(session => SessionViewDto.mapToView(session));
  }
}
