import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ collection: 'revoked_tokens' })
export class RevokedToken {
  @Prop({ type: String, required: true })
  token: string;

  @Prop({ type: Date, default: Date.now })
  revokedAt: Date;
}

export const RevokedTokenSchema = SchemaFactory.createForClass(RevokedToken);
RevokedTokenSchema.loadClass(RevokedToken);
export type RevokedTokenDocument = HydratedDocument<RevokedToken>;
export type RevokedTokenModelType = Model<RevokedToken> & typeof RevokedToken;
