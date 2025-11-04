// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';

// import { DomainException, DomainExceptionCode } from 'src/core/exceptions/domain-exception';
// import { RefreshTokenPayloadDto } from '../dto/payload.dto';
// import { SessionModelType, Session, SessionDocument } from '../domain/session.entity';
// import { Types } from 'mongoose';
// import { RevokedToken, RevokedTokenModelType } from '../domain/revoked-token.entity';

// @Injectable()
// export class SessionsRepository {
//   constructor(
//     @InjectModel(Session.name) private SessionModel: SessionModelType,
//     @InjectModel(RevokedToken.name) private RevokedTokenModel: RevokedTokenModelType,
//   ) {}

//   async createSession(data: { userId: number; deviceId: string; ip: string; title: string }) {
//     return await this.SessionModel.create({
//       userId: data.userId,
//       deviceId: data.deviceId,
//       lastActiveDate: new Date(),
//       expiresAt: new Date(Date.now() + 20 * 1000),
//       ip: data.ip,
//       title: data.title,
//     });
//   }

//   async updateSession(data: {
//     userId: number;
//     deviceId: string;
//     ip: string;
//     title: string;
//     lastActiveDate: Date;
//     expiresAt: Date;
//   }) {
//     return await this.SessionModel.updateOne(
//       { userId: data.userId, deviceId: data.deviceId },
//       {
//         $set: {
//           lastActiveDate: data.lastActiveDate,
//           expiresAt: data.expiresAt,
//           ip: data.ip,
//           title: data.title,
//         },
//       },
//     );
//   }

//   async deleteByDeviceId(userId: Types.ObjectId, deviceId: Types.ObjectId) {
//     const result = await this.SessionModel.deleteOne({ userId: userId, deviceId: deviceId });
//     if (result.deletedCount === 0) {
//       throw new DomainException({
//         code: DomainExceptionCode.NotFound,
//         message: 'Session not found',
//       });
//     }
//     return;
//   }

//   async deleteAllOtherDevices(userId: Types.ObjectId, deviceId: Types.ObjectId) {
//     await this.SessionModel.deleteMany({
//       userId: userId,
//       deviceId: { $ne: deviceId },
//     });
//     return;
//   }

//   async findByTokenPayloadOrFail(payload: RefreshTokenPayloadDto): Promise<SessionDocument> {
//     const session = await this.SessionModel.findOne({
//       userId: new Types.ObjectId(payload.userId),
//       deviceId: new Types.ObjectId(payload.deviceId),
//     });
//     if (!session) {
//       throw new DomainException({
//         code: DomainExceptionCode.Unauthorized,
//         message: 'Session not found',
//       });
//     }
//     return session;
//   }

//   async invalidateToken(token: string): Promise<void> {
//     await this.RevokedTokenModel.create({
//       token: token,
//       revokedAt: new Date(),
//     });
//   }
//   async isTokenRevoked(token: string): Promise<void> {
//     const isRevoked = await this.RevokedTokenModel.findOne({ token: token });
//     if (isRevoked) {
//       throw new DomainException({
//         code: DomainExceptionCode.Unauthorized,
//         message: 'Token was revoked',
//       });
//     }
//     return;
//   }
// }
