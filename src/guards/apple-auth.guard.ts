import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthProvider } from '../enums';

@Injectable()
export class AppleAuthGuard extends AuthGuard(AuthProvider.Apple) {}
