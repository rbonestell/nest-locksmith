import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { Inject, Injectable } from '@nestjs/common';
import { LocksmithModuleOptions } from '../locksmith.module';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider } from '../enums';

@Injectable()
export class AppleAuthStrategy extends PassportStrategy(
  Strategy,
  AuthProvider.Apple,
) {
  constructor(
    @Inject('LOCKSMITH_OPTIONS')
    private readonly options: LocksmithModuleOptions,
    private jwtService: JwtService,
  ) {
    super({
      ...options?.external?.apple,
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    idToken: string,
    profile,
  ) {
    const decodedToken = this.jwtService.decode(idToken, { json: true });

    if (!decodedToken) return null;

    const { email, email_verified } = decodedToken;
    // Ensure email address is verified
    if (!email_verified) return null;

    // JWT token should contain email if authenticated
    return {
      provider: 'apple',
      providerId: profile?.id,
      username: email,
    };
  }
}
