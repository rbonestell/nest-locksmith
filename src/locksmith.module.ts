import { DynamicModule, Logger, Provider } from '@nestjs/common';
import { LocksmithService } from './locksmith.service';
import { JwtModule } from '@nestjs/jwt';

export interface OauthOptions {
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
}

export interface LocksmithModuleOptions {
  jwt: {
    secret: string;
    expiresIn: number;
    sessionCookieName: string;
  };
  external: {
    google: OauthOptions;
    microsoft: OauthOptions;
  };
}

export class LocksmithModule {
  static forRoot(options?: LocksmithModuleOptions): DynamicModule {
    const imports: DynamicModule[] = [];

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
    }

    // Custom Locksmith Options Provider
    const optionsProvider: Provider = {
      provide: 'LOCKSMITH_OPTIONS',
      useValue: options,
    };

    return {
      module: LocksmithModule,
      imports,
      providers: [optionsProvider, LocksmithService, Logger],
      exports: [LocksmithService],
    };
  }
}
