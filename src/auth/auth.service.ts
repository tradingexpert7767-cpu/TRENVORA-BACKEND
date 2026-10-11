import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcryptjs';
import type { Profile, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import { toSafeUser } from './safe-user.js';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
  ) {
    this.googleClient = new OAuth2Client(this.config.get<string>('google.clientId'));
  }

  async signup(userEmail: string, password: string, name?: string) {
    const normalizedEmail = userEmail.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email: normalizedEmail, passwordHash, name },
    });

    await this.sendVerificationOtp(user.id, normalizedEmail, name ?? null);
    return { requiresVerification: true, email: normalizedEmail };
  }

  async verifyOtp(userEmail: string, code: string) {
    const normalizedEmail = userEmail.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('Account not found');

    const otp = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        code,
        purpose: 'email_verification',
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) throw new BadRequestException('Invalid or expired code');

    await this.prisma.$transaction([
      this.prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } }),
    ]);

    const verifiedUser = { ...user, emailVerified: true };
    return this.issueSession(verifiedUser, user.profile);
  }

  async resendOtp(userEmail: string) {
    const normalizedEmail = userEmail.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) throw new NotFoundException('Account not found');
    if (user.emailVerified) throw new BadRequestException('Email already verified');

    await this.sendVerificationOtp(user.id, normalizedEmail, user.name);
    return { sent: true };
  }

  async login(userEmail: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail.toLowerCase() },
      include: { profile: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.emailVerified) {
      await this.sendVerificationOtp(user.id, user.email, user.name);
      return { requiresVerification: true, email: user.email };
    }

    return this.issueSession(user, user.profile);
  }

  async googleLogin(idToken: string) {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.config.get<string>('google.clientId'),
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const googleEmail = payload.email.toLowerCase();
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId: payload.sub }, { email: googleEmail }] },
      include: { profile: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { email: googleEmail, googleId: payload.sub, name: payload.name, emailVerified: true },
        include: { profile: true },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: payload.sub, name: user.name ?? payload.name, emailVerified: true },
        include: { profile: true },
      });
    }

    return this.issueSession(user, user.profile);
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    if (!user) throw new UnauthorizedException();
    return toSafeUser(user, user.profile);
  }

  private async sendVerificationOtp(userId: string, userEmail: string, name: string | null) {
    // Invalidate old OTPs first
    await this.prisma.otpCode.updateMany({
      where: { userId, purpose: 'email_verification', usedAt: null },
      data: { usedAt: new Date() },
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.otpCode.create({
      data: { userId, code, purpose: 'email_verification', expiresAt },
    });

    await this.email.sendOtp(userEmail, name, code);
  }

  private issueSession(user: User, profile: Profile | null) {
    const accessToken = this.jwt.sign({ sub: user.id, email: user.email });
    return { accessToken, user: toSafeUser(user, profile) };
  }
}
