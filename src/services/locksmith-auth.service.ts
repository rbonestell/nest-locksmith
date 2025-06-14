import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import { AuthProvider } from '../enums';
import { LocksmithModuleOptions } from '../locksmith.module';
import { JwtPayload } from '../strategies/jwt.strategy';

export interface AccessToken {
  accessToken: string;
}

export interface ILocksmithAuthService {
  createAccessToken(payload: JwtPayload): Promise<AccessToken>;
  createExternalAccessToken(
    payload: JwtPayload,
    externalId: string,
    authProvider: AuthProvider,
  ): Promise<AccessToken>;
  clearSessionCookie(res: {
    clearCookie?: (name: string, options?: any) => any;
  }): void;
}

@Injectable()
export class LocksmithAuthService implements ILocksmithAuthService {
	constructor(
    private readonly jwtService: JwtService,
    @Inject('LOCKSMITH_OPTIONS')
    private readonly options: LocksmithModuleOptions,
	) {}

	private _cachedIssuer?: string; // Cache for the issuer value

	private resolveIssuer(): string | undefined {
		if (this._cachedIssuer) return this._cachedIssuer; // Return cached value if available
		if (this.options?.jwt?.issuerName) {
			this._cachedIssuer = this.options.jwt.issuerName;
			return this._cachedIssuer;
		}
		try {
			const pkg = JSON.parse(
				readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
			);
			this._cachedIssuer = pkg.name as string;
			return this._cachedIssuer;
		} catch {
			return undefined;
		}
	}

	async createAccessToken(payload: JwtPayload): Promise<AccessToken> {
		const tokenPayload = { ...payload };
		if (!tokenPayload.iss) {
			const issuer = this.resolveIssuer();
			if (issuer) tokenPayload.iss = issuer;
		}
		if (!tokenPayload.jti) tokenPayload.jti = uuid();
		const accessToken = await this.jwtService.signAsync(tokenPayload);
		return { accessToken };
	}

	async createExternalAccessToken(
		payload: JwtPayload,
		externalId: string,
		authProvider: AuthProvider,
	): Promise<AccessToken> {
		const tokenPayload = {
			...payload,
			externalId,
			provider: authProvider,
		} as JwtPayload & { externalId: string; provider: AuthProvider };
		if (!tokenPayload.iss) {
			const issuer = this.resolveIssuer();
			if (issuer) tokenPayload.iss = issuer;
		}
		if (!tokenPayload.jti) tokenPayload.jti = uuid();
		const accessToken = await this.jwtService.signAsync(tokenPayload);
		return { accessToken };
	}

	clearSessionCookie(res: {
    clearCookie?: (name: string, options?: any) => any;
  }): void {
		const name = this.options?.jwt?.sessionCookieName;
		if (name && typeof res.clearCookie === 'function') {
			const opts = this.options?.cookieOptions;
			if (opts) res.clearCookie(name, opts);
			else res.clearCookie(name);
		}
	}
}
