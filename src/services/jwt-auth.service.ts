import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class JwtAuthService {
  constructor(private jwtService: JwtService) {}

  sign(payload: JwtPayload) {
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
