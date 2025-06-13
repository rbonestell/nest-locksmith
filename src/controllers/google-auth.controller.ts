import { Controller, Get, Inject, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import {
  LOCKSMITH_AUTH_SERVICE,
  LocksmithModuleOptions,
} from '../locksmith.module';
import { ILocksmithAuthService } from '../services/locksmith-auth.service';

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
  async googleAuth(@Req() _req) {
    // Guard redirects
  }

  @Get('redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    const { accessToken } = await this.authService.createAccessToken(req.user);
    res.cookie(this.options?.jwt?.sessionCookieName, accessToken, {
      httpOnly: true,
      sameSite: 'lax',
    });
    return res.redirect('/profile');
  }
}
