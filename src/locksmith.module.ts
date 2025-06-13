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
import { LocksmithAuthService } from './services/locksmith-auth.service';
import { GoogleOauthController } from './controllers/google-auth.controller';
import { MicrosoftOauthController } from './controllers/microsoft-auth.controller';
import { AppleOauthController } from './controllers/apple-auth.controller';

export interface OAuthOptions {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

export const LOCKSMITH_AUTH_SERVICE = 'LOCKSMITH_AUTH_SERVICE';

export interface LocksmithModuleOptions {
  jwt?: {
    secret: string;
    expiresIn: number;
    sessionCookieName: string;
    /**
     * Optional issuer name used for the `iss` claim when creating JWTs.
     * When omitted, the value is read from the host application's package.json name.
     */
    issuerName?: string;
  };
  external?: {
    google?: OAuthOptions;
    microsoft?: OAuthOptions;
    apple?: {
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
    const providers: Array<any> = [];
    const controllers: Array<any> = [];

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
      exports.push(JwtAuthGuard, JwtAuthStrategy, LOCKSMITH_AUTH_SERVICE);
      providers.push(JwtAuthGuard, JwtAuthStrategy);
    }

    if (options?.external?.apple) {
      exports.push(AppleAuthGuard, AppleAuthStrategy);
      providers.push(AppleAuthGuard, AppleAuthStrategy);
      controllers.push(AppleOauthController);
    }

    if (options?.external?.google) {
      exports.push(GoogleAuthGuard, GoogleAuthStrategy);
      providers.push(GoogleAuthGuard, GoogleAuthStrategy);
      controllers.push(GoogleOauthController);
    }

    if (options?.external?.microsoft) {
      exports.push(MicrosoftAuthGuard, MicrosoftAuthStrategy);
      providers.push(MicrosoftAuthGuard, MicrosoftAuthStrategy);
      controllers.push(MicrosoftOauthController);
    }

    // Custom Locksmith Options Provider
    const optionsProvider: Provider = {
      provide: 'LOCKSMITH_OPTIONS',
      useValue: options,
    };

    const authServiceProvider: Provider = {
      provide: LOCKSMITH_AUTH_SERVICE,
      useClass: LocksmithAuthService,
    };
    providers.push(authServiceProvider, optionsProvider, Logger);

    return {
      module: LocksmithModule,
      imports,
      controllers,
      exports,
      providers,
    };
  }
}
