import { EmailService } from '../../src/modules/notifications/application/email.service';

export class EmailServiceMock extends EmailService {
  //override method
  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    console.log('Call mock method sendConfirmationEmail / EmailServiceMock');
    await email
    return;
  }
}
