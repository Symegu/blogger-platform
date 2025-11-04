import { SessionData } from '../../domain/session.entity';

export class SessionViewDto {
  deviceId: string;
  title: string | null;
  ip: string | null;
  lastActiveDate: Date;

  // static mapToView(session: SessionDocument): SessionViewDto {
  //   const dto = new SessionViewDto();

  //   dto.deviceId = session.deviceId.toString();
  //   dto.title = session.title;
  //   dto.ip = session.ip;
  //   dto.lastActiveDate = session.lastActiveDate;

  //   return dto;
  // }

  static mapFromSql(session: SessionData): SessionViewDto {
    const dto = new SessionViewDto();

    dto.deviceId = session.device_id.toString();
    dto.title = session.title;
    dto.ip = session.ip;
    dto.lastActiveDate = session.last_active_date;

    return dto;
  }
}
