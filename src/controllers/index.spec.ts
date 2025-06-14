import * as controllers from './index';
import { GoogleOauthController } from './google-auth.controller';
import { MicrosoftOauthController } from './microsoft-auth.controller';
import { AppleOauthController } from './apple-auth.controller';

describe('controllers index', () => {
	it('re-exports controller classes', () => {
		expect(controllers.GoogleOauthController).toBe(GoogleOauthController);
		expect(controllers.MicrosoftOauthController).toBe(MicrosoftOauthController);
		expect(controllers.AppleOauthController).toBe(AppleOauthController);
	});
});
