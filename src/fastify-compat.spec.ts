import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { LocksmithAuthService } from './services/locksmith-auth.service';
import { GoogleOauthController } from './controllers/google-auth.controller';
import { LOCKSMITH_AUTH_SERVICE, LocksmithModuleOptions } from './locksmith.module';
import { AuthProvider } from './enums';
import { ILocksmithAuthService } from './services/locksmith-auth.service';


describe('Fastify compatibility', () => {
  it('clearSessionCookie supports Fastify reply', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test' })],
      providers: [
        LocksmithAuthService,
        { provide: 'LOCKSMITH_OPTIONS', useValue: { jwt: { sessionCookieName: 'sid' }, cookieOptions: { path: '/app' } } },
      ],
    }).compile();

    const service = moduleRef.get<LocksmithAuthService>(LocksmithAuthService);
    const reply: any = { clearCookie: jest.fn() };
    service.clearSessionCookie(reply);
    expect(reply.clearCookie).toHaveBeenCalledWith('sid', { path: '/app' });
  });

  it('googleAuthRedirect works with Fastify reply', async () => {
    const options: LocksmithModuleOptions = {
      jwt: { sessionCookieName: 'sid' } as any,
      cookieOptions: { secure: false } as any,
      redirectPath: '/home',
    };
    const authService: ILocksmithAuthService = {
      createExternalAccessToken: jest.fn().mockResolvedValue({ accessToken: 'token' }),
      createAccessToken: jest.fn(),
      clearSessionCookie: jest.fn(),
    };
    const controller = new GoogleOauthController(options, authService);
    const req: any = { user: { providerId: 'gid', username: 'bob@test.com', name: 'Bob' } };
    const reply: any = { cookie: jest.fn(), redirect: jest.fn() };
    await controller.googleAuthRedirect(req, reply);
    expect(authService.createExternalAccessToken).toHaveBeenCalledWith(
      { sub: 'bob@test.com', username: 'bob@test.com', name: 'Bob' },
      'gid',
      AuthProvider.Google,
    );
    expect(reply.cookie).toHaveBeenCalledWith('sid', 'token', { httpOnly: true, secure: false, sameSite: 'lax' });
    expect(reply.redirect).toHaveBeenCalledWith('/home');
  });
});
