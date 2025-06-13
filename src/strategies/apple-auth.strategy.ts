import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';
import { Inject, Injectable } from '@nestjs/common';
import { LocksmithModuleOptions } from '../locksmith.module';
import { JwtService } from '@nestjs/jwt';
import * as jwksClient from 'jwks-rsa';
import type { JwksClient } from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import { AuthProvider } from '../enums';

@Injectable()
export class AppleAuthStrategy extends PassportStrategy(
  Strategy,
  AuthProvider.Apple,
) {
  constructor(
    @Inject('LOCKSMITH_OPTIONS')
    private readonly options: LocksmithModuleOptions,
    private jwtService: JwtService,
  ) {
    super({
      ...options?.external?.apple,
    });
    this.jwks = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
    });
  }

  private readonly jwks: JwksClient;

  async validate(
    _accessToken: string,
    _refreshToken: string,
    idToken: string,
    profile,
  ) {
    // Validate JWT token with Apple JWK keys
    const client = this.jwks;

    let payload: any;

    try {
      const decoded = (jwt.decode(idToken, { complete: true }) ?? {}) as {
        header?: { kid?: string };
      };

      if (!decoded.header?.kid) return null;

      const key = await client.getSigningKey(decoded.header.kid);
      const publicKey = key.getPublicKey();

      payload = await this.jwtService.verifyAsync(idToken, {
        publicKey,
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
        audience: this.options?.external?.apple?.clientID,
      });
    } catch {
      return null;
    }

    const { email, email_verified } = payload as {
      email?: string;
      email_verified?: boolean;
    };

    // Ensure email address is verified
    if (!email_verified) return null;

    // JWT token should contain email if authenticated
    return {
      provider: AuthProvider.Apple,
      providerId: profile?.id,
      username: email,
    };
  }
}
