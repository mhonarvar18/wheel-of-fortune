import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';

@Injectable()
export class IdentityService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  async register({ mobile, password }: { mobile: string; password: string }) {
    const exists = await this.userModel.findOne({ where: { mobile } });
    if (exists) throw new Error('User already exists');

    const hash = await bcrypt.hash(password, 10);
    const user = await this.userModel.create({ mobile, password: hash });

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
}
