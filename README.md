<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">A server-side authorization library for NestJS APIs 🔐</p>
<p align="center">
  <a href="https://www.npmjs.com/package/nest-locksmith" target="_blank"><img alt="NPM Version" src="https://img.shields.io/npm/v/nest-locksmith?logo=npm&logoColor=white"></a>
  <a href="https://github.com/rbonestell/nest-locksmith/actions/workflows/build.yml?query=branch%3Amain" target="_blank"><img alt="Build Status" src="https://img.shields.io/github/actions/workflow/status/rbonestell/nest-locksmith/build.yml?logo=typescript&logoColor=white"></a>
  <a href="https://github.com/rbonestell/nest-locksmith/actions/workflows/test.yml?query=branch%3Amain" target="_blank"><img alt="Test Results" src="https://img.shields.io/github/actions/workflow/status/rbonestell/nest-locksmith/test.yml?branch=main&logo=jest&logoColor=white&label=tests"></a>
  <a href="https://app.codecov.io/gh/rbonestell/nest-locksmith/tree/main/lib" target="_blank"><img alt="Test Coverage" src="https://img.shields.io/codecov/c/github/rbonestell/nest-locksmith?logo=codecov&logoColor=white"></a>
  <a href="https://github.com/rbonestell/nest-locksmith/blob/main/LICENSE" target="_blank"><img alt="GitHub License" src="https://img.shields.io/github/license/rbonestell/nest-locksmith?color=71C347"></a>
</p>

## Description

A lightweight library for adding Passport authentication functionality to your NestJS API. Adds support for JWT validation and authentication, and OAuth authentication with Apple, Google, and Microsoft!

This library abstracts Passport and respective Passport authentication strategy libraries, simplifying their implementation into one simple NestJS module:

- [passport-jwt](https://www.passportjs.org/packages/passport-jwt/)
- [passport-apple](https://www.passportjs.org/packages/passport-apple/)
- [passport-google-oauth20](https://www.passportjs.org/packages/passport-google-oauth20/)
- [passport-microsoft](https://www.passportjs.org/packages/passport-microsoft/)

## Installation

```bash
$ npm i nest-locksmith
```

## Implementation

### 1. Add the `LocksmithModule` to your module's imports

Add the `LocksmithModule` to your NestJS application's appropriate module's `imports` and provide it with your desired `LocksmithModuleOptions` values:

```typescript
LocksmithModule.forRoot({
  redirectPath: '/profile',
  cookieOptions: { httpOnly: true, sameSite: 'lax' },
  jwt: {
    secret: 'hunter2',
    expiresIn: 3600,
    sessionCookieName: 'MyAppSession'
  },
  external: {
    google: {
      clientID: 'google-oauth-client-id',
      clientSecret: 'super-secret-google-oauth-client-secret',
      callbackURL: 'https://www.example.com/auth/callback/google'
    },
    microsoft: {
      clientID: 'microsoft-oauth-client-id',
      clientSecret: 'super-secret-microsoft-oauth-client-secret',
      callbackURL: 'https://www.example.com/auth/callback/microsoft'
    },
    apple: {
      clientID: 'apple-auth-client-id',
      teamID: 'apple-auth-team-id',
      callbackURL: 'https://www.example.com/auth/callback/apple',
      keyID: 'apple-auth-key-id',
      privateKeyString: 'apple-auth-private-key-bytes-string',
      passReqToCallback: true
    }
  }
}),
```

Optionally, `redirectPath` controls where users are redirected after a successful
OAuth login, and `cookieOptions` are passed directly to Express when
setting the session cookie.

Alternatively, you can load configuration asynchronously using Nest's
`ConfigModule`:

```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';

LocksmithModule.forRootAsync({
  imports: [ConfigModule.forRoot()],
  useFactory: (config: ConfigService) => ({
    jwt: {
      secret: config.get<string>('JWT_SECRET'),
      expiresIn: config.get<number>('JWT_EXPIRES_IN'),
      sessionCookieName: 'MyAppSession',
    },
  }),
  inject: [ConfigService],
}),
```

Each authentication mechanism is activated by providing it's respective configuration value in the `LocksmithModuleOptions` provided to the `LocksmithModule`. Omitting `jwt`, `external.apple`, `external.google`, or `external.microsoft`, or `external` entirely, will disable support for that functionality and the respective AuthGuards and Passport strategies will not be registered by the `LocksmithModule` with the NestJS dependency container.

### 2. Use the built-in OAuth controllers

When you supply configuration for Apple, Google, or Microsoft, `LocksmithModule` registers route controllers automatically. Each provider exposes `/auth/<provider>` and `/auth/<provider>/redirect` endpoints, so no additional controller code is required.

### 3. Generate a session token after verifying credentials

Your application is responsible for verifying user credentials. Once verified, use `LocksmithAuthService` to generate a JWT and store it in the cookie named by the value of `sessionCookieName`:

```typescript
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(LOCKSMITH_AUTH_SERVICE)
    private readonly auth: LocksmithAuthService,
  ) {}

  @Post('login')
  async login(@Body() user: any, @Res() res: any) {
    // perform your own credential checks here
    const { accessToken } = await this.auth.createAccessToken({
      sub: user.id,
      username: user.username,
    });
    res.cookie('MyAppSession', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
    });
    return res.sendStatus(200);
  }
}
```

Routes that require authentication can be protected using the `JwtAuthGuard`:

```typescript
@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  @Get()
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
```
### Clearing the session cookie

To remove the JWT session cookie during logout, call `clearSessionCookie` on
`LocksmithAuthService` with the response or reply object used by Express or
Fastify:

```typescript
@Post('logout')
logout(@Res() res: any) {
  this.auth.clearSessionCookie(res);
  return res.sendStatus(200);
}
```

## External Auth Providers

In order to support and configure each external auth provider, you will need to register your application with each and obtain the proper OAuth credentials which to provide in the `LocksmithModuleOptions`.

### Apple

1. Sign in to the [Apple Developer](https://developer.apple.com/account/) portal and create a Service ID with **Sign in with Apple** enabled.
2. Add your web domain and the redirect URL (for example `https://example.com/auth/apple/redirect`).
3. Generate a private key for Sign in with Apple and note the **Key ID** and **Team ID**.
4. Provide these values as `clientID`, `teamID`, `callbackURL`, `keyID`, and `privateKeyString` in `LocksmithModuleOptions` and enable `passReqToCallback` if desired.

### Google

1. Open the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and create an **OAuth 2.0 Client ID**.
2. Configure an authorized redirect URI matching your `callbackURL` (e.g., `https://example.com/auth/google/redirect`).
3. Supply the generated `clientID`, `clientSecret`, and `callbackURL` under `external.google` in `LocksmithModuleOptions`.

### Microsoft

1. In the [Azure Portal](https://portal.azure.com/) register a new application.
2. Add a **Web** redirect URI that matches your `callbackURL` such as `https://example.com/auth/microsoft/redirect`.
3. Create a client secret and record the **Application (client) ID**.
4. Set `clientID`, `clientSecret`, and `callbackURL` in `external.microsoft` to enable Microsoft OAuth.

## Testing

Install dependencies before running tests:

```bash
$ npm install

# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## License

The nest-locksmith project is [MIT licensed](LICENSE).
