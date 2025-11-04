export class RefreshTokenPayloadDto {
  userId: number;
  deviceId: string;
}
export class AccessTokenPayloadDto {
  userId: number;
  login: string;
}

export class SessionDomainDto {
  userId: number;
  deviceId: string;
  title: string | null;
  ip: string | null;
  refreshTokenHash: string;
  expiresAt: Date;
  lastActiveDate: Date;
}
