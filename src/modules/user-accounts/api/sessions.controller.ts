import { Controller, Delete, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Cookies } from 'src/core/decorators/param/extract-cookie.decorator';
import { GetUserSessionsQuery } from '../application/queries/get-user-sessions.query';
import { TerminateOtherSessionsCommand } from '../application/usecases/terminate-other-sessions';
import { TerminateDeviceSessionCommand } from '../application/usecases/terminate-session.usecase';

@Controller('security/devices')
export class SessionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getUserSessions(@Cookies('refreshToken') refreshToken: string) {
    return this.queryBus.execute(new GetUserSessionsQuery(refreshToken));
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateOtherSessions(@Cookies('refreshToken') refreshToken: string) {
    await this.commandBus.execute(new TerminateOtherSessionsCommand(refreshToken));
    return;
  }

  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async terminateDevice(
    @Param('deviceId') deviceId: string,
    @Cookies('refreshToken') refreshToken: string,
  ) {
    await this.commandBus.execute(new TerminateDeviceSessionCommand(deviceId, refreshToken));
    return;
  }
}
