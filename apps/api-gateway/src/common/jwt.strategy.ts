import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * نوع payloadی که در JWT ذخیره می‌شود
 */
interface JwtPayload {
  sub: string; // userId
  mobile: string;
}

/**
 * نتیجه‌ی نهایی validate که در req.user قرار می‌گیرد
 */
export interface JwtUser {
  userId: string;
  mobile: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'dev',
    });
  }

  validate(payload: JwtPayload): JwtUser {
    // payload = { sub: userId, mobile }
    return {
      userId: payload.sub,
      mobile: payload.mobile,
    };
  }
}
