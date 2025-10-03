import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import {
  DomainException,
  DomainExceptionCode,
} from '../../../core/exceptions/domain-exception';
import {
  ConfirmationInfoDto,
  RecoveryInfoDto,
} from '../../../modules/notifications/dto/confirmation-info.dto';

@Injectable()
export class AuthRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async confirmUserEmail(email: string) {
    const user = await this.UserModel.findOne({ email, deletedAt: null });
    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'NotFound',
        errorsMessages: [{ message: 'User not found', field: 'code' }],
      });
    }

    if (user.isEmailConfirmed !== false) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
        errorsMessages: [{ message: 'Email already confirmed', field: 'code' }],
      });
    }

    if (user.confirmationCodeExpiration.getTime() < Date.now()) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Code expired',
        errorsMessages: [
          { message: 'Code expired', field: 'confirmationCodeExpiration' },
        ],
      });
    }

    user.confirmEmail();
    await user.save();
    return user;
  }

  async setUserConfirmation(confirmationInfo: ConfirmationInfoDto) {
    const user = await this.UserModel.findOne({
      email: confirmationInfo.email,
      deletedAt: null,
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'NotFound',
        errorsMessages: [{ message: 'User not found', field: 'email' }],
      });
    }

    if (user.isEmailConfirmed !== false) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
        errorsMessages: [{ message: 'Email already confirmed', field: 'code' }],
      });
    }

    user.setUserConfirmationInfo(
      confirmationInfo.confirmationCode,
      confirmationInfo.confirmationCodeExpiration,
    );
    await user.save();
    return user;
  }

  async setUserRecovery(recoveryInfo: RecoveryInfoDto) {
    const user = await this.UserModel.findOne({
      email: recoveryInfo.email,
      deletedAt: null,
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'NotFound',
        errorsMessages: [{ message: 'User not found', field: 'email' }],
      });
    }

    if (user.isEmailConfirmed !== false) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email already confirmed',
        errorsMessages: [{ message: 'Email already confirmed', field: 'code' }],
      });
    }

    user.setUserPasswordRecovery(
      recoveryInfo.recoveryCode,
      recoveryInfo.recoveryCodeExpiration,
    );
    await user.save();
    return user;
  }

  async setNewUserPassword(email: string, hashPassword: string) {
    const user = await this.UserModel.findOne({ email, deletedAt: null });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'NotFound',
        errorsMessages: [{ message: 'User not found', field: 'email' }],
      });
    }
    user.setNewPassword(hashPassword);
    await user.save();
    return user;
  }
}
