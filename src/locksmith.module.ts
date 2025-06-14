import {
	DynamicModule,
	Logger,
	Provider,
	Module,
	ModuleMetadata,
	Type,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
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
import { CookieOptions } from 'express';

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
  /** Optional path used by OAuth controllers for the final redirect */
  redirectPath?: string;
  /**
   * Cookie options used when setting or clearing the session cookie.
   * Compatible with Express and Fastify (@fastify/cookie).
   */
  cookieOptions?: CookieOptions;
}

export interface LocksmithOptionsFactory {
  createLocksmithOptions():
    | Promise<LocksmithModuleOptions>
    | LocksmithModuleOptions;
}

export interface LocksmithModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<LocksmithOptionsFactory>;
  useClass?: Type<LocksmithOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<LocksmithModuleOptions> | LocksmithModuleOptions;
  inject?: any[];
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

	private static async createOptionsFromAsync(
		asyncOptions: LocksmithModuleAsyncOptions,
	): Promise<LocksmithModuleOptions | undefined> {
    @Module({
    	imports: asyncOptions.imports ?? [],
    	providers: asyncOptions.useClass
    		? [{ provide: asyncOptions.useClass, useClass: asyncOptions.useClass }]
    		: [],
    })
		class TempModule {}

    const app = await NestFactory.createApplicationContext(TempModule, {
    	logger: false,
    });
    try {
    	if (asyncOptions.useFactory) {
    		const deps: unknown[] = await Promise.all(
    			(asyncOptions.inject ?? []).map((dep) =>
    				app.get<unknown>(
              dep as
                | string
                | symbol
                | (new (...args: any[]) => unknown)
                | Type<unknown>,
    				),
    			),
    		);
    		return await asyncOptions.useFactory(...deps);
    	}
    	const optionsFactory = app.get<LocksmithOptionsFactory>(
    		asyncOptions.useExisting ?? asyncOptions.useClass!,
    	);
    	return await optionsFactory.createLocksmithOptions();
    } finally {
    	await app.close();
    }
	}

	static async forRootAsync(
		options: LocksmithModuleAsyncOptions,
	): Promise<DynamicModule> {
		const resolvedOptions = await this.createOptionsFromAsync(options);
		return this.forRoot(resolvedOptions);
	}
}
