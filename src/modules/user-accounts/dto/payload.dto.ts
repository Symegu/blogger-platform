import { Types } from 'mongoose';

export class RefreshTokenPayloadDto {
  userId: Types.ObjectId;
  deviceId: Types.ObjectId;
}
export class AccessTokenPayloadDto {
  userId: Types.ObjectId;
  login: string;
}

export class SessionDomainDto {
  userId: Types.ObjectId;
  deviceId: Types.ObjectId;
  title: string | null;
  ip: string | null;
  refreshTokenHash: string;
  expiresAt: Date;
  lastActiveDate: Date;
}
