import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { LocksmithAuthService } from './services/locksmith-auth.service';
import { JwtPayload } from './strategies/jwt.strategy';

describe('LocksmithAuthService', () => {
  it('creates tokens with default iss and jti', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test' })],
      providers: [
        LocksmithAuthService,
        {
          provide: 'LOCKSMITH_OPTIONS',
          useValue: { jwt: { issuerName: 'MyApp' } },
        },
      ],
    }).compile();

    const service = moduleRef.get<LocksmithAuthService>(LocksmithAuthService);
    const jwtService = moduleRef.get(JwtService);

    const payload: JwtPayload = { sub: '1', username: 'bob' };
    const { accessToken } = await service.createAccessToken(payload);
    const decoded = jwtService.verify(accessToken);
    expect(decoded.iss).toBe('MyApp');
    expect(decoded.jti).toBeDefined();
  });

  it('clears the configured session cookie', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test' })],
      providers: [
        LocksmithAuthService,
        {
          provide: 'LOCKSMITH_OPTIONS',
          useValue: { jwt: { sessionCookieName: 'MyCookie' } },
        },
      ],
    }).compile();

    const service = moduleRef.get<LocksmithAuthService>(LocksmithAuthService);
    const res = { clearCookie: jest.fn() } as any;
    service.clearSessionCookie(res);
    expect(res.clearCookie).toHaveBeenCalledWith('MyCookie');
  });
});
