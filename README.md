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
      callbackURL: 'https://www.example.com/auth/callback/apple'
      keyID: 'apple-auth-key-id',
      privateKeyString: 'apple-auth-private-key-bytes-string',
      passReqToCallback: true
    }
  }
}),
```

Each authentication mechanism is activated by providing it's respective configuration value in the `LocksmithModuleOptions` provided to the `LocksmithModule`. Omitting `jwt`, `external.apple`, `external.google`, or `external.microsoft`, or `external` entirely, will disable support for that functionality and the respective AuthGuards and Passport strategies will not be registered by the `LocksmithModule` with the NestJS dependency container.

### 2. Add the respective external auth provider controllers to your API

In order to properly expose the external authentication provider callback URLs, you must add the proper controllers to your API module.

> ***// TODO: Determine if nest-locksmith should provide out-of-the-box controllers for each provider or developer should implement custom @Locksmith controller attribute?***

Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit amet consectetur adipiscing elit quisque faucibus.

## External Auth Providers

In order to support and configure each external auth provider, you will need to register your application with each and obtain the proper OAuth credentials which to provide in the `LocksmithModuleOptions`.

### Apple

Lorem ipsum

### Google

Lorem ipsum

### Microsoft

Lorem Ipsum

## Testing

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## License

The nest-locksmith project is [MIT licensed](LICENSE).