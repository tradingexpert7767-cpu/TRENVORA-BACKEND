import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DEMO_USER, toSafeUser } from './demo-user.js';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  login(email: string, password: string) {
    if (email.toLowerCase() !== DEMO_USER.email || password !== DEMO_USER.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.jwt.sign({ sub: DEMO_USER.id, email: DEMO_USER.email });
    return { accessToken, user: toSafeUser() };
  }

  getProfile(userId: string) {
    if (userId !== DEMO_USER.id) {
      throw new UnauthorizedException();
    }
    return toSafeUser();
  }
}
