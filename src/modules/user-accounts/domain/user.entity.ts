import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { CreateUserDomainDto, UpdateUserDto } from '../dto/create-user.dto';

@Schema()
export class Name {
  @Prop()
  firstName: string;
  @Prop()
  lastName: string;
}
export const NameSchema = SchemaFactory.createForClass(Name);

@Schema({ timestamps: true })
export class User {
  /**
   * Login of the user (must be uniq)
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true, unique: true }) //
  login: string;

  /**
   * Password hash for authentication
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true })
  passwordHash: string;

  /**
   * Email of the user
   * @type {string}
   * @required
   */
  @Prop({ type: String, required: true, unique: true }) //
  email: string;

  /**
   * Email confirmation status (if not confirmed in 2 days account will be deleted)
   * @type {boolean}
   * @default false
   */
  @Prop({ type: Boolean, required: true, default: false })
  isEmailConfirmed: boolean;

  @Prop({ type: String, required: false })
  confirmationCode: string;

  @Prop({ type: Date, required: false })
  confirmationCodeExpiration: Date;

  @Prop({ type: String, required: false, default: null })
  recoveryCode: string | null;

  @Prop({ type: Date, default: null, required: false })
  recoveryCodeExpiration: Date | null;

  // @Prop(NameSchema) this variant from doc. doesn't make validation for inner object
  @Prop({ type: NameSchema })
  name: Name;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;

  /**
   * Deletion timestamp, nullable, if date exist, means entity soft deleted
   * @type {Date | null}
   */
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;
  /**
   * Virtual property to get the stringified ObjectId
   * @returns {string} The string representation of the ID
   * если ипсльзуете по всей системе шв айди как string, можете юзать, если id
   */

  // get id() {
  //   // @ts-ignore
  //   return this._id.toString();
  // }

  static createInstance(dto: CreateUserDomainDto): UserDocument {
    const user = new this();
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.login = dto.login;
    //user.isEmailConfirmed = false; // пользователь ВСЕГДА должен после регистрации подтверждить свой Email
    // user.confirmationCode = dto.confirmationCode ? dto.confirmationCode : null;
    // user.confirmationCodeExpiration = dto.confirmationCodeExpiration || new Date(Date.now());
    user.name = {
      firstName: 'firstName xxx',
      lastName: 'lastName yyy',
    };
    console.log('user', user);

    return user as UserDocument;
  }

  /**
   * Marks the user as deleted
   * Throws an error if already deleted
   * @throws {Error} If the entity is already deleted
   * DDD continue: инкапсуляция (вызываем методы, которые меняют состояние\св-ва) объектов согласно правилам этого объекта
   */
  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  /**
   * Updates the user instance with new data
   * Resets email confirmation if email is updated
   * @param {UpdateUserDto} dto - The data transfer object for user updates
   * DDD continue: инкапсуляция (вызываем методы, которые меняют состояние\св-ва) объектов согласно правилам этого объекта
   */
  update(dto: UpdateUserDto) {
    if (dto.email !== this.email) {
      this.isEmailConfirmed = false;
    }
    this.email = dto.email;
    this.isEmailConfirmed = true;
  }

  confirmEmail() {
    this.isEmailConfirmed = true;
  }

  setUserConfirmationInfo(code: string, expiration: Date) {
    this.confirmationCode = code;
    this.confirmationCodeExpiration = expiration;
  }

  setUserPasswordRecovery(code: string, expiration: Date) {
    this.recoveryCode = code;
    this.recoveryCodeExpiration = expiration;
  }

  setNewPassword(hash: string) {
    this.passwordHash = hash;
    this.recoveryCode = null;
    this.recoveryCodeExpiration = null;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

//регистрирует методы сущности в схеме
UserSchema.loadClass(User);

//Типизация документа
export type UserDocument = HydratedDocument<User>;

//Типизация модели + статические методы
export type UserModelType = Model<UserDocument> & typeof User;
