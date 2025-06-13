import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { LocksmithModuleOptions } from '../locksmith.module';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: number;
  username: string;
  iss?: string;
  aud?: string;
  jti?: string;
  [claim: string]: string | number | undefined;
}

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject('LOCKSMITH_OPTIONS')
    private readonly options: LocksmithModuleOptions,
    private readonly jwtService: JwtService,
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
