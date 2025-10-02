import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  async createHash(password: string): Promise<string> {
    const salt: string = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
