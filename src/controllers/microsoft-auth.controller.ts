import { Controller, Get, Inject, Req, Res, UseGuards } from '@nestjs/common';
import { MicrosoftAuthGuard } from '../guards/microsoft-auth.guard';
import {
  LOCKSMITH_AUTH_SERVICE,
  LocksmithModuleOptions,
} from '../locksmith.module';
import { ILocksmithAuthService } from '../services/locksmith-auth.service';
import { AuthProvider } from '../enums';

@Controller('auth/microsoft')
export class MicrosoftOauthController {
  constructor(
    @Inject('LOCKSMITH_OPTIONS')
    private readonly options: LocksmithModuleOptions,
    @Inject(LOCKSMITH_AUTH_SERVICE)
    private readonly authService: ILocksmithAuthService,
  ) {}

  @Get()
  @UseGuards(MicrosoftAuthGuard)
  async microsoftAuth() {
    // Guard redirects
  }

  @Get('redirect')
  @UseGuards(MicrosoftAuthGuard)
  async microsoftAuthRedirect(@Req() req, @Res() res): Promise<any> {
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    const { accessToken } = await this.authService.createExternalAccessToken(
      req.user,
      req.user?.providerId,
      AuthProvider.Microsoft,
    );
    /* eslint-enable @typescript-eslint/no-unsafe-argument */
    const cookieOpts =
      this.options?.cookieOptions ?? ({ httpOnly: true, sameSite: 'lax' } as any);
    res.cookie(this.options?.jwt?.sessionCookieName, accessToken, cookieOpts);
    const redirect = this.options?.redirectPath ?? '/profile';
    return res.redirect(redirect);
  }
}
