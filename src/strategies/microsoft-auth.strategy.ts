import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { Profile } from 'passport';
import { Inject, Injectable } from '@nestjs/common';
import { LocksmithModuleOptions } from '../locksmith.module';
import { AuthProvider } from '../enums';

export interface MicrosoftProfile extends Profile {
  userPrincipalName?: string;
}

@Injectable()
export class MicrosoftAuthStrategy extends PassportStrategy(
  Strategy,
  AuthProvider.Microsoft,
) {
  constructor(
    @Inject('LOCKSMITH_OPTIONS')
    private readonly options: LocksmithModuleOptions,
  ) {
    super({
      ...options?.external?.microsoft,
      scope: ['user.read'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: MicrosoftProfile,
  ) {
    return {
      provider: 'microsoft',
      providerId: profile?.id,
      name: profile?.displayName,
      username: profile?.userPrincipalName,
    };
  }
}
