import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { Inject, Injectable } from '@nestjs/common';
import { LocksmithModuleOptions } from '../locksmith.module';
import { AuthProvider } from '../enums';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(
  Strategy,
  AuthProvider.Google,
) {
  constructor(
    @Inject('LOCKSMITH_OPTIONS')
    private readonly options: LocksmithModuleOptions,
  ) {
    super({
      ...options?.external?.google,
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    // Ensure user email address is verified
    const emailValidated = profile?.emails?.[0]?.verified ?? false;
    if (!emailValidated) return null;
    return {
      provider: 'google',
      providerId: profile?.id,
      name: profile?.name?.givenName,
      username: profile?.emails?.[0]?.value,
    };
  }
}
