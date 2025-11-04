// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Types } from 'mongoose';

// import { DomainException, DomainExceptionCode } from '../../../core/exceptions/domain-exception';
// import { User, UserDocument, UserModelType } from '../domain/user.entity';

// @Injectable()
// export class UsersRepository {
//   //инжектирование модели через DI
//   constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

//   async findById(id: Types.ObjectId): Promise<UserDocument | null> {
//     return this.UserModel.findOne({
//       _id: id,
//       deletedAt: null,
//     });
//   }

//   async save(user: UserDocument) {
//     await user.save();
//   }

//   async findOrNotFoundFail(id: Types.ObjectId): Promise<UserDocument> {
//     const user = await this.UserModel.findOne({
//       _id: id,
//       deletedAt: null,
//     });

//     if (!user) {
//       throw new DomainException({
//         code: DomainExceptionCode.NotFound,
//         message: 'User not found',
//       });
//     }

//     return user;
//   }

//   async findByLoginOrEmail(loginOrEmail: string) {
//     return this.UserModel.findOne({
//       $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
//       deletedAt: null,
//     });
//   }
// }
