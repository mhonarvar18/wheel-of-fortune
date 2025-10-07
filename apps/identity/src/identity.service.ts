import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { MSG } from '@app/common';
import { randomInt } from 'crypto';

@Injectable()
export class IdentityService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @Inject('POINTS_CLIENT') private readonly pointsClient: ClientProxy,
  ) {}

  async register({
    mobile,
    password,
    referralCode,
  }: {
    mobile: string;
    password: string;
    referralCode: string;
  }) {
    const exists = await this.userModel.findOne({ where: { mobile } });
    if (exists) throw new Error('User already exists');

    const hash = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({
      mobile,
      password: hash,
      referralCode: this.genReferralCode(),
    });

    await firstValueFrom(
      this.pointsClient
        .send(MSG.POINTS_APPLY, {
          userId: user.id,
          delta: +1,
          reason: 'signup',
          externalId: `signup:${user.id}`,
        })
        .pipe(timeout(2000)),
    );

    if (referralCode) {
      const ref = await this.userModel.findOne({ where: { referralCode } });
      if (ref && ref.id !== user.id) {
        // رویداد fire-and-forget (Points خودش دو Entry می‌سازد)
        this.pointsClient.emit(MSG.REFERRAL_SIGNUP, {
          referrerId: ref.id,
          refereeId: user.id,
          at: new Date().toISOString(),
        });
      }
    }
    return { id: user.id, mobile: user.mobile };
  }

  async login({ mobile, password }: { mobile: string; password: string }) {
    const user = await this.userModel.findOne({ where: { mobile } });
    if (!user) throw new UnauthorizedException('User not found');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const token = jwt.sign({ sub: user.id, mobile: user.mobile }, process.env.JWT_SECRET || 'dev', {
      expiresIn: '7d',
    });

    return { access_token: token, user: { id: user.id, mobile: user.mobile } };
  }

  genReferralCode() {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }
}
