import { Controller, Get, Inject, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { LocksmithModuleOptions } from '../locksmith.module';

@Controller('auth/google')
export class GoogleOauthController {
  constructor(
    @Inject('LOCKSMITH_OPTIONS')
    private readonly options: LocksmithModuleOptions,
  ) {}

  @Get()
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() _req) {
    // Guard redirects
  }

  @Get('redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    const { accessToken } = this.jwtAuthService.login(req.user);
    res.cookie(this.options?.jwt?.sessionCookieName, accessToken, {
      httpOnly: true,
      sameSite: 'lax',
    });
    return res.redirect('/profile');
  }
}
