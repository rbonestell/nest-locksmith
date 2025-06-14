import { Controller, Get, Inject, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import {
	LOCKSMITH_AUTH_SERVICE,
	LocksmithModuleOptions,
} from '../locksmith.module';
import { ILocksmithAuthService } from '../services/locksmith-auth.service';
import { AuthProvider } from '../enums';

@Controller('auth/google')
export class GoogleOauthController {
	constructor(
    @Inject('LOCKSMITH_OPTIONS')
    private readonly options: LocksmithModuleOptions,
    @Inject(LOCKSMITH_AUTH_SERVICE)
    private readonly authService: ILocksmithAuthService,
	) {}

  @Get()
  @UseGuards(GoogleAuthGuard)
	async googleAuth() {
		// Guard redirects
	}

  @Get('redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res): Promise<any> {
  	/* eslint-disable @typescript-eslint/no-unsafe-argument */
  	const payload = {
  		sub: req.user?.username,
  		username: req.user?.username,
  		name: req.user?.name,
  	};
  	const { accessToken } = await this.authService.createExternalAccessToken(
  		payload,
  		req.user?.providerId,
  		AuthProvider.Google,
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
