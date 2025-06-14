import * as strategies from './index';
import { GoogleAuthStrategy } from './google-auth.strategy';
import { MicrosoftAuthStrategy } from './microsoft-auth.strategy';
import { AppleAuthStrategy } from './apple-auth.strategy';
import { JwtAuthStrategy } from './jwt.strategy';

describe('strategies index', () => {
  it('re-exports strategy classes', () => {
    expect(strategies.GoogleAuthStrategy).toBe(GoogleAuthStrategy);
    expect(strategies.MicrosoftAuthStrategy).toBe(MicrosoftAuthStrategy);
    expect(strategies.AppleAuthStrategy).toBe(AppleAuthStrategy);
    expect(strategies.JwtAuthStrategy).toBe(JwtAuthStrategy);
  });
});
