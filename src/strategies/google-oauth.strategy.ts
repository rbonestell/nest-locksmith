import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { Inject, Injectable } from '@nestjs/common';
import { LocksmithModuleOptions } from '../locksmith.module';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject('LOCKSMITH_OPTIONS')
    private readonly options: LocksmithModuleOptions,
  ) {
    super({
      clientID: options?.external?.google?.clientId,
      clientSecret: options?.external?.google?.clientSecret,
      callbackURL: options?.external?.google?.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    return {
      provider: 'google',
      providerId: profile?.id,
      name: profile?.name?.givenName,
      username: profile?.emails?.[0]?.value,
    };
  }
}
