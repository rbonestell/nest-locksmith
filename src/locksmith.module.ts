import { DynamicModule, Logger, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { MicrosoftAuthGuard } from './guards/microsoft-auth.guard';
import { GoogleAuthStrategy } from './strategies/google-auth.strategy';
import { MicrosoftAuthStrategy } from './strategies/microsoft-auth.strategy';
import { JwtAuthStrategy } from './strategies/jwt.strategy';
import { AppleAuthGuard } from './guards/apple-auth.guard';
import { AppleAuthStrategy } from './strategies/apple-auth.strategy';

export interface OAuthOptions {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

export const LOCKSMITH_AUTH_SERVICE = 'LOCKSMITH_AUTH_SERVICE';

export interface LocksmithModuleOptions {
  jwt: {
    secret: string;
    expiresIn: number;
    sessionCookieName: string;
  };
  external: {
    google: OAuthOptions;
    microsoft: OAuthOptions;
    apple: {
      clientID: string;
      teamID: string;
      callbackURL: string;
      keyID: string;
      privateKeyString: string;
      passReqToCallback: boolean;
    };
  };
}

export class LocksmithModule {
  static forRoot(options?: LocksmithModuleOptions): DynamicModule {
    const imports: Array<any> = [];
    const exports: Array<any> = [];

    // Initialize JWT if options were provided
    if (options?.jwt) {
      imports.push(
        JwtModule.register({
          secret: options.jwt.secret,
          signOptions: {
            expiresIn: options.jwt.expiresIn,
          },
        }),
      );
      exports.push(JwtAuthGuard, JwtAuthStrategy);
    }

    if (options?.external?.apple)
      exports.push(AppleAuthGuard, AppleAuthStrategy);

    if (options?.external?.google)
      exports.push(GoogleAuthGuard, GoogleAuthStrategy);

    if (options?.external?.microsoft)
      exports.push(MicrosoftAuthGuard, MicrosoftAuthStrategy);

    // Custom Locksmith Options Provider
    const optionsProvider: Provider = {
      provide: 'LOCKSMITH_OPTIONS',
      useValue: options,
    };

    return {
      module: LocksmithModule,
      imports,
      exports,
      providers: [optionsProvider, Logger],
    };
  }
}
