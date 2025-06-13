import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { LocksmithModuleOptions } from '../locksmith.module';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  /**
   * The subject of the JWT, typically the user ID or username.
   */
  sub: string;

  /**
   * The issuer of the JWT, if not provided, it will be derived from the package.json name.
   */
  iss?: string;

  /**
   * The audience for which the JWT is intended.
   */
  aud?: string;

  /**
   * The unique identifier for the JWT.
   */
  jti?: string;

  /**
   * Custom claims can be added to the JWT payload.
   * These can include any additional information you want to include in the token.
   * For example, roles, permissions, or other user-specific data.
   * Note: Avoid using reserved claims like 'sub', 'iss', 'aud', and 'jti' as custom claims.
   */
  [customClaim: string]: string | number | undefined;
}

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('LOCKSMITH_OPTIONS')
    options: LocksmithModuleOptions,
  ) {
    const extractJwtFromCookie = (req: any) => {
      let token: string = '';

      if (req && req.cookies) {
        token = req.cookies[options.jwt!.sessionCookieName] as string;
      }
      return token;
    };

    super({
      jwtFromRequest: extractJwtFromCookie,
      ignoreExpiration: false,
      secretOrKey: options.jwt!.secret,
    });
  }

  validate(payload: JwtPayload) {
    return { ...payload };
  }
}
