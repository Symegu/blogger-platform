import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiBody } from '@nestjs/swagger';
import { Response } from 'express';

import { ExtractUserFromRequest } from '../../../core/decorators/param/extract-user-from-request';
import { PasswordChangeDto } from '../../../modules/notifications/dto/confirmation-info.dto';
import { EmailInputDto } from '../../../modules/notifications/dto/email.input-dto';
import { LocalAuthGuard } from '../../../modules/user-accounts/guards/local/local-auth.guard';
import { EmailService } from '../../notifications/application/email.service';
import { AuthService } from '../application/auth.service';
import { RegisterUserCommand } from '../application/usecases/register-user.usecase';
import { UserContextDto } from '../dto/create-user.dto';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { LoginUserCommand } from '../application/usecases/login-user.usecase';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';

@Controller('auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private authService: AuthService,
    private emailService: EmailService,
    private authQueryRepository: AuthQueryRepository,
  ) {
    console.log('AuthController created');
  }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  //swagger doc
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        login: { type: 'string', example: 'login123' },
        password: { type: 'string', example: 'superpassword' },
      },
    },
  })
  async login(
    @ExtractUserFromRequest() user: UserContextDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const tokens = await this.commandBus.execute(
      new LoginUserCommand({ userId: user.id, login: user.login }),
    );

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: tokens.accessToken };
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  //swagger doc
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

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  //swagger doc
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
    const user = await this.authQueryRepository.getUserByConfirmationCode(code);
    await this.authService.confirmUserEmail(user.email);
    return;
  }

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
    const updatedUser = await this.authService.changeEmailConfirmation(dto.email);
    this.emailService.sendConfirmationEmail(updatedUser.email, updatedUser.confirmationCode);
    return;
  }

  @Post('password-recovery')
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
  async passwordRecovery(@Body() dto: EmailInputDto) {
    const user = await this.authService.getPasswordRecovery(dto.email);
    this.emailService.sendRecoveryPasswordEmail(user.email, user.recoveryCode!);
    return;
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  //swagger doc
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
    const user = await this.authQueryRepository.getUserByRecoveryCode(dto.recoveryCode);
    await this.authService.changeUserPassword(user.email, dto.newPassword);
    return;
  }

  // @Get('me')
  // @UseGuards(JwtAuthGuard)
  // async me(@ExtractUserFromRequest() user: UserContextDto) {
  //   return this.authQueryRepository.getMe(user.id);
  // }
}
