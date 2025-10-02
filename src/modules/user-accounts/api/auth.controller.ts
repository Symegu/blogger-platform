import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { ApiBody } from '@nestjs/swagger';
import { LocalAuthGuard } from 'src/modules/user-accounts/guards/local/local-auth.guard';
import { ExtractUserFromRequest } from 'src/core/decorators/param/extract-user-from-request';
import { JwtAuthGuard } from '../guards/bearer/jwt-auth.guard';
import { AuthQueryRepository } from '../infrastructure/query/auth.query-repository';
import { UsersService } from '../application/users.service';
import { UserContextDto } from '../dto/create-user.dto';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { EmailService } from '../../notifications/application/email.service';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { EmailInputDto } from 'src/modules/notifications/dto/email.input-dto';
import { PasswordChangeDto } from 'src/modules/notifications/dto/confirmation-info.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private emailService: EmailService,
    private authQueryRepository: AuthQueryRepository,
    private usersQueryRepository: UsersQueryRepository,
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
  async login(@ExtractUserFromRequest() user: UserContextDto) {
    return this.authService.login(user.id);
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
    const userId = await this.usersService.createUser(body);
    const user = await this.authQueryRepository.getConfirmationInfo(userId);
    this.emailService.sendConfirmationEmail(user.email, user.confirmationCode);
    return;
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
    const updatedUser = await this.authService.changeEmailConfirmation(
      dto.email,
    );
    this.emailService.sendConfirmationEmail(
      updatedUser.email,
      updatedUser.confirmationCode,
    );
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
    const user = await this.authQueryRepository.getUserByRecoveryCode(
      dto.recoveryCode,
    );
    await this.authService.changeUserPassword(user.email, dto.newPassword);
    return;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@ExtractUserFromRequest() user: UserContextDto) {
    return this.authQueryRepository.getMe(user.id);
  }
}
