import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class Argon2Utils {
  async encPassword(input: { password: string }): Promise<string> {
    const { password } = input;
    return argon2.hash(password);
  }

  async verifyPassword(input: {
    password: string;
    encPassword: string;
  }): Promise<boolean> {
    const { password, encPassword } = input;
    return argon2.verify(encPassword, password);
  }
}
