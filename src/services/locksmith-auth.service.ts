import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import { AuthProvider } from '../enums';
import { LocksmithModuleOptions } from '../locksmith.module';
import { JwtPayload } from '../strategies/jwt.strategy';

export interface ILocksmithAuthService {
  createAccessToken(payload: JwtPayload): Promise<string>;
  createExternalAccessToken(
    payload: JwtPayload,
    externalId: string,
    authProvider: AuthProvider,
  ): Promise<string>;
}

@Injectable()
export class LocksmithAuthService implements ILocksmithAuthService {
	constructor(
    private readonly jwtService: JwtService,
    @Inject('LOCKSMITH_OPTIONS')
    private readonly options: LocksmithModuleOptions,
	) {}

	private _issuerName?: string; // Cache for the issuer value

	private resolveIssuer(): string | undefined {
		if (this._issuerName) return this._issuerName; // Return cached value if available
		if (this.options?.jwt?.issuerName) {
			this._issuerName = this.options.jwt.issuerName;
			return this._issuerName;
		}
		try {
			const pkg = JSON.parse(
				readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
			);
			this._issuerName = pkg.name as string;
			return this._issuerName;
		} catch {
			return undefined;
		}
	}

	async createAccessToken(payload: JwtPayload): Promise<string> {
		const tokenPayload = { ...payload };
		if (!tokenPayload.iss) {
			const issuer = this.resolveIssuer();
			if (issuer) tokenPayload.iss = issuer;
		}
		if (!tokenPayload.jti) tokenPayload.jti = uuid();
		return await this.jwtService.signAsync(tokenPayload);
	}

	async createExternalAccessToken(
		payload: JwtPayload,
		externalId: string,
		authProvider: AuthProvider,
	): Promise<string> {
		const tokenPayload = {
			...payload,
			externalId,
			provider: authProvider,
		} as JwtPayload;
		if (!tokenPayload.iss) {
			const issuer = this.resolveIssuer();
			if (issuer) tokenPayload.iss = issuer;
		}
		if (!tokenPayload.jti) tokenPayload.jti = uuid();
		return await this.jwtService.signAsync(tokenPayload);
	}
}
