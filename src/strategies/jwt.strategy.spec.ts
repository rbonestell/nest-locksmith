import { JwtAuthStrategy } from './jwt.strategy';

describe('JwtAuthStrategy', () => {
  const options = { jwt: { secret: 'test', sessionCookieName: 'sid' } } as any;

  it('extracts token from request cookies', () => {
    const strategy = new JwtAuthStrategy(options);
    const token = (strategy as any)._jwtFromRequest({ cookies: { sid: 'abc' } });
    expect(token).toBe('abc');
  });

  it('returns empty string when cookie missing', () => {
    const strategy = new JwtAuthStrategy(options);
    const token = (strategy as any)._jwtFromRequest({});
    expect(token).toBe('');
  });

  it('validate returns payload', () => {
    const strategy = new JwtAuthStrategy(options);
    const payload = { sub: '1', username: 'bob' };
    expect(strategy.validate(payload)).toEqual(payload);
  });
});
