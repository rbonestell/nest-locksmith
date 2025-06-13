import { GoogleAuthStrategy } from './google-auth.strategy';
import { MicrosoftAuthStrategy, MicrosoftProfile } from './microsoft-auth.strategy';
import { AppleAuthStrategy } from './apple-auth.strategy';
import { JwtService } from '@nestjs/jwt';

describe('OAuth Strategies', () => {
  it('GoogleAuthStrategy.validate returns payload', async () => {
    const strategy = new GoogleAuthStrategy({
      external: {
        google: { clientID: 'id', clientSecret: 'secret', callbackURL: 'http://localhost' },
      },
    });
    const profile: any = {
      id: '123',
      name: { givenName: 'Bob' },
      emails: [{ value: 'bob@test.com', verified: true }],
    };
    const result = await strategy.validate('', '', profile);
    expect(result).toEqual({
      provider: 'google',
      providerId: '123',
      name: 'Bob',
      username: 'bob@test.com',
    });
  });

  it('MicrosoftAuthStrategy.validate returns payload', async () => {
    const strategy = new MicrosoftAuthStrategy({
      external: {
        microsoft: { clientID: 'id', clientSecret: 'secret', callbackURL: 'http://localhost' },
      },
    });
    const profile: MicrosoftProfile = {
      id: '456',
      displayName: 'Alice',
      userPrincipalName: 'alice@ms.com',
    } as MicrosoftProfile;
    const result = await strategy.validate('', '', profile);
    expect(result).toEqual({
      provider: 'microsoft',
      providerId: '456',
      name: 'Alice',
      username: 'alice@ms.com',
    });
  });

  it('AppleAuthStrategy.validate returns payload', async () => {
    const jwtService = {
      decode: jest.fn().mockReturnValue({ email: 'app@test.com', email_verified: true }),
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
    expect(jwtService.decode).toHaveBeenCalledWith('idToken', { json: true });
    expect(result).toEqual({
      provider: 'apple',
      providerId: '789',
      username: 'app@test.com',
    });
  });
});
