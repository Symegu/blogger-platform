import { SessionDocument } from '../../domain/session.entity';

export class SessionViewDto {
  deviceId: string;
  title: string | null;
  ip: string | null;
  lastActiveDate: Date;

  static mapToView(session: SessionDocument): SessionViewDto {
    const dto = new SessionViewDto();

    dto.deviceId = session.deviceId.toString();
    dto.title = session.title;
    dto.ip = session.ip;
    dto.lastActiveDate = session.lastActiveDate;

    return dto;
  }
}
