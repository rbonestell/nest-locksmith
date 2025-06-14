import * as guards from './index';
import { JwtAuthGuard } from './jwt.guard';
import { GoogleAuthGuard } from './google-auth.guard';
import { MicrosoftAuthGuard } from './microsoft-auth.guard';
import { AppleAuthGuard } from './apple-auth.guard';

describe('guards index', () => {
  it('re-exports guard classes', () => {
    expect(guards.JwtAuthGuard).toBe(JwtAuthGuard);
    expect(guards.GoogleAuthGuard).toBe(GoogleAuthGuard);
    expect(guards.MicrosoftAuthGuard).toBe(MicrosoftAuthGuard);
    expect(guards.AppleAuthGuard).toBe(AppleAuthGuard);
  });
});
