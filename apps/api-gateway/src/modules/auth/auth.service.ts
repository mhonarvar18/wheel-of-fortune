import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { LoginResponse, RegisterResponse } from 'libs/common/src/types/identity.types';
import { firstValueFrom, timeout } from 'rxjs';

const MSG = { AUTH_REGISTER: 'auth.register', AUTH_LOGIN: 'auth.login' } as const;

@Injectable()
export class AuthService {
  constructor(@Inject('IDENTITY_CLIENT') private readonly identityClient: ClientProxy) {}

  async register(dto: { mobile: string; password: string }) {
    const obs$ = this.identityClient
      .send<RegisterResponse>(MSG.AUTH_REGISTER, dto)
      .pipe(timeout(3000));
    return await firstValueFrom(obs$);
  }

  async login(dto: { mobile: string; password: string }) {
    const obs$ = this.identityClient.send<LoginResponse>(MSG.AUTH_LOGIN, dto).pipe(timeout(3000));
    return await firstValueFrom(obs$);
  }
}
