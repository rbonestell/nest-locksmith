import { Controller, Get, Inject, Req, Res, UseGuards } from '@nestjs/common';
import { AuthProvider } from '../enums';
import { AppleAuthGuard } from '../guards/apple-auth.guard';
import {
	LOCKSMITH_AUTH_SERVICE,
	LocksmithModuleOptions,
} from '../locksmith.module';
import { ILocksmithAuthService } from '../services/locksmith-auth.service';

@Controller('auth/apple')
export class AppleOauthController {
	constructor(
    @Inject('LOCKSMITH_OPTIONS')
    private readonly options: LocksmithModuleOptions,
    @Inject(LOCKSMITH_AUTH_SERVICE)
    private readonly authService: ILocksmithAuthService,
	) {}

  @Get()
  @UseGuards(AppleAuthGuard)
	async appleAuth() {
		// Guard redirects
	}

  @Get('redirect')
  @UseGuards(AppleAuthGuard)
  async appleAuthRedirect(@Req() req, @Res() res): Promise<any> {
        /* eslint-disable @typescript-eslint/no-unsafe-argument */
        const payload = {
                sub: req.user?.username,
                username: req.user?.username,
                name: req.user?.name,
        };

        const accessToken = await this.authService.createExternalAccessToken(
                payload,
                req.user?.providerId,
                AuthProvider.Apple,
        );

  	const cookieOpts = {
  		httpOnly: true,
  		secure: true,
  		sameSite: 'lax',
  		...this.options?.cookieOptions,
  	};
  	res.cookie(this.options?.jwt?.sessionCookieName, accessToken, cookieOpts);
  	const redirect = this.options?.redirectPath ?? '/profile';
  	return res.redirect(redirect);
  }
}
