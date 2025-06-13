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
}

@Injectable()
export class LocksmithAuthService implements ILocksmithAuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('LOCKSMITH_OPTIONS')
    private readonly options: LocksmithModuleOptions,
  ) {}

  private resolveIssuer(): string | undefined {
    if (this.options?.issuerName) return this.options.issuerName;
    try {
      const pkg = JSON.parse(
        readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
      );
      return pkg.name as string;
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
}
