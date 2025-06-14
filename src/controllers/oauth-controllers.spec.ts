import { GoogleOauthController } from './google-auth.controller';
import { MicrosoftOauthController } from './microsoft-auth.controller';
import { AppleOauthController } from './apple-auth.controller';
import { AuthProvider } from '../enums';
import { ILocksmithAuthService } from '../services/locksmith-auth.service';

describe('OAuth Controllers', () => {
	const options = {
		jwt: { sessionCookieName: 'sid' },
		cookieOptions: { secure: true } as any,
		redirectPath: '/home',
	} as any;

	let authService: { createExternalAccessToken: jest.Mock };
	let res: { cookie: jest.Mock; redirect: jest.Mock };

	beforeEach(() => {
		authService = {
			createExternalAccessToken: jest
				.fn()
				.mockResolvedValue({ accessToken: 'token' }),
		};
		res = { cookie: jest.fn(), redirect: jest.fn() } as any;
	});

	it('googleAuthRedirect creates token and sets cookie', async () => {
		const controller = new GoogleOauthController(
			options,
      authService as unknown as ILocksmithAuthService,
		);
		const req: any = {
			user: { providerId: 'gid', name: 'Bob', username: 'bob@test.com' },
		};
		await controller.googleAuthRedirect(req, res as any);
		expect(authService.createExternalAccessToken).toHaveBeenCalledWith(
			{ sub: 'bob@test.com', username: 'bob@test.com', name: 'Bob' },
			'gid',
			AuthProvider.Google,
		);

		expect(res.cookie).toHaveBeenCalledWith('sid', 'token', {
			secure: true,
			httpOnly: true,
			sameSite: 'lax',
		});
		expect(res.redirect).toHaveBeenCalledWith('/home');
	});

	it('microsoftAuthRedirect creates token and sets cookie', async () => {
		const controller = new MicrosoftOauthController(
			options,
      authService as unknown as ILocksmithAuthService,
		);
		const req: any = {
			user: { providerId: 'mid', username: 'alice@ms.com', name: 'Alice' },
		};
		await controller.microsoftAuthRedirect(req, res as any);
		expect(authService.createExternalAccessToken).toHaveBeenCalledWith(
			req.user,
			'mid',
			AuthProvider.Microsoft,
		);
		expect(res.cookie).toHaveBeenCalledWith('sid', 'token', {
			secure: true,
			httpOnly: true,
			sameSite: 'lax',
		});
		expect(res.redirect).toHaveBeenCalledWith('/home');
	});

	it('appleAuthRedirect creates token and sets cookie', async () => {
		const controller = new AppleOauthController(
			options,
      authService as unknown as ILocksmithAuthService,
		);
		const req: any = {
			user: { providerId: 'aid', username: 'apple@test.com' },
		};
		await controller.appleAuthRedirect(req, res as any);
		expect(authService.createExternalAccessToken).toHaveBeenCalledWith(
			req.user,
			'aid',
			AuthProvider.Apple,
		);
		expect(res.cookie).toHaveBeenCalledWith('sid', 'token', {
			secure: true,
			httpOnly: true,
			sameSite: 'lax',
		});
		expect(res.redirect).toHaveBeenCalledWith('/home');
	});
});
