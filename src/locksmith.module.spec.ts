import { LocksmithModule } from './locksmith.module';
import { GoogleOauthController } from './controllers/google-auth.controller';
import { MicrosoftOauthController } from './controllers/microsoft-auth.controller';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtAuthStrategy } from './strategies/jwt.strategy';
import { MicrosoftAuthGuard } from './guards/microsoft-auth.guard';
import { MicrosoftAuthStrategy } from './strategies/microsoft-auth.strategy';

class TestFactory {
	createLocksmithOptions() {
		return {
			jwt: { secret: 'f', expiresIn: 1, sessionCookieName: 'sid' },
			external: {
				microsoft: { clientID: 'id', clientSecret: 'sec', callbackURL: 'cb' },
			},
		} as any;
	}
}

describe('LocksmithModule', () => {
	it('forRoot configures providers and controllers', () => {
		const mod = LocksmithModule.forRoot({
			jwt: { secret: 'a', expiresIn: 1, sessionCookieName: 'sid' },
			external: {
				google: { clientID: 'id', clientSecret: 'sec', callbackURL: 'cb' },
			},
		});
		expect(mod.controllers).toEqual([GoogleOauthController]);
		expect(mod.imports?.length).toBe(1);
		expect(mod.providers).toEqual(
			expect.arrayContaining([JwtAuthGuard, JwtAuthStrategy]),
		);
	});

	it('forRootAsync loads options from factory', async () => {
		const mod = await LocksmithModule.forRootAsync({
			// eslint-disable-next-line @typescript-eslint/require-await
			useFactory: async () => ({
				jwt: { secret: 'x', expiresIn: 1, sessionCookieName: 'sid' },
			}),
		});
		expect(mod.imports?.length).toBe(1);
		expect(mod.providers).toEqual(
			expect.arrayContaining([JwtAuthGuard, JwtAuthStrategy]),
		);
	});

	it('forRootAsync loads options from class', async () => {
		const mod = await LocksmithModule.forRootAsync({ useClass: TestFactory });
		expect(mod.controllers).toEqual([MicrosoftOauthController]);
		expect(mod.providers).toEqual(
			expect.arrayContaining([MicrosoftAuthGuard, MicrosoftAuthStrategy]),
		);
	});
});
