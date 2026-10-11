import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('resend.apiKey'));
    this.from = this.config.get<string>('resend.from') ?? 'Trenvora <noreply@trenvora.com>';
  }

  async sendOtp(to: string, name: string | null, otp: string): Promise<void> {
    const displayName = name ?? to.split('@')[0];
    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject: `${otp} — Your Trenvora verification code`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#0a0a0a;color:#e5e5e5;border-radius:12px">
          <h1 style="font-size:20px;font-weight:600;margin:0 0 8px">Verify your email</h1>
          <p style="color:#a1a1aa;margin:0 0 32px;font-size:14px">Hi ${displayName}, enter this code to activate your Trenvora account.</p>
          <div style="background:#18181b;border:1px solid #27272a;border-radius:8px;padding:24px;text-align:center;margin-bottom:32px">
            <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#22c55e">${otp}</span>
          </div>
          <p style="color:#71717a;font-size:12px;margin:0">Code expires in 10 minutes. If you didn't request this, ignore this email.</p>
          <hr style="border:none;border-top:1px solid #27272a;margin:24px 0"/>
          <p style="color:#52525b;font-size:11px;margin:0">
            Trenvora — Paper trading simulator for educational purposes only. Not financial advice.
          </p>
        </div>
      `,
    });

    if (error) {
      this.logger.error('Failed to send OTP email', error);
      throw new Error('Failed to send verification email');
    }
  }
}
