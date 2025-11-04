// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { HydratedDocument, Model, Types } from 'mongoose';

// @Schema()
// export class Session {
//   @Prop({ type: Types.ObjectId, required: true })
//   userId: Types.ObjectId;

//   @Prop({ type: Types.ObjectId, required: true })
//   deviceId: Types.ObjectId;

//   @Prop({ type: String, default: null })
//   title: string | null;

//   @Prop({ type: String, default: null })
//   ip: string | null;

//   @Prop({ type: Date, required: true })
//   expiresAt: Date;

//   @Prop({ type: Date, required: false, default: new Date() })
//   lastActiveDate: Date;

//   //   @Prop({ type: Date, default: null })
//   //   deletedAt: Date | null;
// }

// export const SessionSchema = SchemaFactory.createForClass(Session);
// SessionSchema.loadClass(Session);
// export type SessionDocument = HydratedDocument<Session>;
// export type SessionModelType = Model<SessionDocument> & typeof Session;

export interface SessionData {
  id: number;
  user_id: number;
  device_id: string;
  title: string | null;
  ip: string | null;
  expires_at: Date;
  last_active_date: Date;
  created_at: Date;
}
