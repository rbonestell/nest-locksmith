import { Controller, Get, Inject, Req, Res, UseGuards } from '@nestjs/common';
import { AppleAuthGuard } from '../guards/apple-auth.guard';
import {
  LOCKSMITH_AUTH_SERVICE,
  LocksmithModuleOptions,
} from '../locksmith.module';
import { ILocksmithAuthService } from '../services/locksmith-auth.service';
import { AuthProvider } from '../enums';

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
    const { accessToken } = await this.authService.createExternalAccessToken(
      req.user,
      req.user?.providerId,
      AuthProvider.Apple,
    );
    /* eslint-enable @typescript-eslint/no-unsafe-argument */
    res.cookie(this.options?.jwt?.sessionCookieName, accessToken, {
      httpOnly: true,
      sameSite: 'lax',
    });
    return res.redirect('/profile');
  }
}
