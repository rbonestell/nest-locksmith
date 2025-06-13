import { GoogleAuthStrategy } from './google-auth.strategy';
import { Profile } from 'passport-google-oauth20';
import {
  MicrosoftAuthStrategy,
  MicrosoftProfile,
} from './microsoft-auth.strategy';
import { AppleAuthStrategy } from './apple-auth.strategy';
import { JwtService } from '@nestjs/jwt';
import * as jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import { AuthProvider } from '../enums';

jest.mock('jwks-rsa');

describe('OAuth Strategies', () => {
  it('GoogleAuthStrategy.validate returns payload', () => {
    const strategy = new GoogleAuthStrategy({
      external: {
        google: {
          clientID: 'id',
          clientSecret: 'secret',
          callbackURL: 'http://localhost',
        },
      },
    });
    const profile: Profile = {
      id: '123',
      name: { givenName: 'Bob' },
      emails: [{ value: 'bob@test.com', verified: true }],
    } as Profile;
    const result = strategy.validate('', '', profile);
    expect(result).toEqual({
      provider: AuthProvider.Google,
      providerId: '123',
      name: 'Bob',
      username: 'bob@test.com',
    });
  });

  it('MicrosoftAuthStrategy.validate returns payload', () => {
    const strategy = new MicrosoftAuthStrategy({
      external: {
        microsoft: {
          clientID: 'id',
          clientSecret: 'secret',
          callbackURL: 'http://localhost',
        },
      },
    });
    const profile: MicrosoftProfile = {
      id: '456',
      displayName: 'Alice',
      userPrincipalName: 'alice@ms.com',
    } as MicrosoftProfile;
    const result = strategy.validate('', '', profile);
    expect(result).toEqual({
      provider: AuthProvider.Microsoft,
      providerId: '456',
      name: 'Alice',
      username: 'alice@ms.com',
    });
  });

  it('AppleAuthStrategy.validate returns payload', async () => {
    const mockGetSigningKey = jest.fn().mockResolvedValue({
      getPublicKey: () => 'public',
    });
    (jwksClient as unknown as jest.Mock).mockReturnValue({
      getSigningKey: mockGetSigningKey,
    });
    jest.spyOn(jwt, 'decode').mockReturnValue({ header: { kid: 'kid' } } as any);

    const jwtService = {
      verifyAsync: jest.fn().mockResolvedValue({
        email: 'app@test.com',
        email_verified: true,
      }),
    } as unknown as JwtService;
    const strategy = new AppleAuthStrategy(
      {
        external: {
          apple: {
            clientID: 'id',
            teamID: 'team',
            callbackURL: 'http://localhost',
            keyID: 'key',
            privateKeyString: 'private',
            passReqToCallback: true,
          },
        },
      },
      jwtService,
    );
    const profile: any = { id: '789' };
    const result = await strategy.validate('', '', 'idToken', profile);
    expect(mockGetSigningKey).toHaveBeenCalledWith('kid');
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('idToken', {
      publicKey: 'public',
      algorithms: ['RS256'],
      issuer: 'https://appleid.apple.com',
      audience: 'id',
    });
    expect(result).toEqual({
      provider: AuthProvider.Apple,
      providerId: '789',
      username: 'app@test.com',
    });
  });
});
