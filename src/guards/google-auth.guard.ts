import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthProvider } from '../enums';

@Injectable()
export class GoogleAuthGuard extends AuthGuard(AuthProvider.Google) {}
