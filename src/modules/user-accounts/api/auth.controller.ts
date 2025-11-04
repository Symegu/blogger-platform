import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Res,
  Get,
  Req,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { Cookies } from 'src/core/decorators/param/extract-cookie.decorator';

import { ExtractUserFromRequest } from '../../../core/decorators/param/extract-user-from-request';
import { PasswordChangeDto } from '../../../modules/notifications/dto/confirmation-info.dto';
import { EmailInputDto } from '../../../modules/notifications/dto/email.input-dto';
import { LocalAuthGuard } from '../../../modules/user-accounts/guards/local/local-auth.guard';
import { ChangePasswordCommand } from '../application/usecases/change-user-password.usecase';
import { ConfirmEmailCommand } from '../application/usecases/confirm-email.usecase';
import { LogoutUserCommand } from '../application/usecases/logout-user.usecase';
import { PasswordRecoveryCommand } from '../application/usecases/password-recovery.usecase';
import { RefreshTokensCommand } from '../application/usecases/refresh-tokens.usecase';
import { RegisterUserCommand } from '../application/usecases/register-user.usecase';
import { ResendEmailConfirmationCommand } from '../application/usecases/resend-email-confirmation.usecase';
import { UserContextDto } from '../dto/create-user.dto';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { LoginUserCommand } from '../application/usecases/login-user.usecase';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { AuthSqlQueryRepository } from '../infrastructure/query/auth-sql.query-repository';

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private authQueryRepository: AuthSqlQueryRepository,
  ) {
    console.log('AuthController created');
  }

  @Throttle({ default: { limit: 5, ttl: 10000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        loginOrEmail: { type: 'string', example: 'login123' },
        password: { type: 'string', example: 'superpassword' },
      },
    },
  })
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<{ accessToken: string }> {
    const ip = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const title = req.headers['user-agent'] || 'device';
    console.log({
      userId: user.id,
      login: user.login,
      ip: ip,
      title: title,
    });

    const tokens = await this.commandBus.execute(
      new LoginUserCommand({
        userId: user.id,
        login: user.login,
        ip: ip,
        title: title,
      }),
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokens.accessToken };
  }

  @Throttle({ default: { limit: 5, ttl: 10000 } })
  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'email@mail.com' },
        login: { type: 'string', example: 'login123' },
        password: { type: 'string', example: 'superpassword' },
      },
    },
  })
  async registration(@Body() body: CreateUserInputDto) {
    return this.commandBus.execute(new RegisterUserCommand(body));
  }

  @Throttle({ default: { limit: 5, ttl: 10000 } })
  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'e5c06e1a-b7c5-4590-9dcb-a6d90124010d',
        },
      },
    },
  })
  async registrationConfirmation(
    // @Query('code') code: string,
    @Body('code') code: string,
  ) {
    return this.commandBus.execute(new ConfirmEmailCommand(code));
  }

  @Throttle({ default: { limit: 5, ttl: 10000 } })
  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  //swagger doc
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'e5c06e1a-b7c5-4590-9dcb-a6d90124010d',
        },
      },
    },
  })
  async emailConfirmationResending(@Body() dto: EmailInputDto) {
    return await this.commandBus.execute(new ResendEmailConfirmationCommand(dto.email));
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'e5c06e1a-b7c5-4590-9dcb-a6d90124010d',
        },
      },
    },
  })
  async passwordRecovery(@Body() dto: EmailInputDto) {
    return await this.commandBus.execute(new PasswordRecoveryCommand(dto.email));
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          example: 'e5c06e1a-b7c5-4590-9dcb-a6d90124010d',
        },
      },
    },
  })
  async setNewPassword(@Body() dto: PasswordChangeDto) {
    return await this.commandBus.execute(
      new ChangePasswordCommand(dto.newPassword, dto.recoveryCode),
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@ExtractUserFromRequest() user: UserContextDto) {
    return this.authQueryRepository.getMe(user.id);
  }

  @Post('refresh-token')
  //@UseGuards(RefreshTokenGuard)
  async refreshToken(
    @Cookies('refreshToken') refreshToken: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const ip = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const title = req.headers['user-agent'] || 'device';
    const result = await this.commandBus.execute(new RefreshTokensCommand(refreshToken, ip, title));
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return res.status(200).send({ accessToken: result.accessToken });
  }

  @Post('logout')
  //@UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Cookies('refreshToken') refreshToken: string,
    //@Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // const ip = Array.isArray(req.headers['x-forwarded-for'])
    //   ? req.headers['x-forwarded-for'][0]
    //   : req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    // const title = req.headers['user-agent'] || 'device';
    await this.commandBus.execute(new LogoutUserCommand(refreshToken));

    res.clearCookie('refreshToken', { path: '/' });
    return;
  }
}
