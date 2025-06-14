import { GoogleOauthController } from './controllers/google-auth.controller';
import { AuthProvider } from './enums';
import { LocksmithModuleOptions } from './locksmith.module';
import { ILocksmithAuthService } from './services/locksmith-auth.service';

describe('Fastify compatibility', () => {

	it('googleAuthRedirect works with Fastify reply', async () => {
		const options: LocksmithModuleOptions = {
			jwt: { sessionCookieName: 'sid' } as any,
			cookieOptions: { secure: false } as any,
			redirectPath: '/home',
		};
		const authService: ILocksmithAuthService = {
			createExternalAccessToken: jest
				.fn()
				.mockResolvedValue('token') as any,
			createAccessToken: jest.fn() as any,
		};
		const controller = new GoogleOauthController(options, authService);
		const req: any = {
			user: { providerId: 'gid', username: 'bob@test.com', name: 'Bob' },
		};
		const reply: any = { cookie: jest.fn(), redirect: jest.fn() };
		await controller.googleAuthRedirect(req, reply);
		expect(authService.createExternalAccessToken).toHaveBeenCalledWith(
			{ sub: 'bob@test.com', username: 'bob@test.com', name: 'Bob' },
			'gid',
			AuthProvider.Google,
		);
		expect(reply.cookie).toHaveBeenCalledWith('sid', 'token', {
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
		});
		expect(reply.redirect).toHaveBeenCalledWith('/home');
	});
});
