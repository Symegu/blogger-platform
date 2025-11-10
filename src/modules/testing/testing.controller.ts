import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    console.log('testing controller created');
  }

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    console.log('testing all-data deleteAll');

    const tables = [
      'Blogs',
      'Posts',
      'Likes',
      'Comments',
      'RevokedTokens',
      'Sessions',
      'PasswordRecoveryCodes',
      'EmailConfirmationCodes',
      'UserNames',
      'Users',
    ];

    await this.dataSource.query(`
    TRUNCATE TABLE ${tables.map(table => `"${table}"`).join(', ')} 
    RESTART IDENTITY
  `);
  }
}
