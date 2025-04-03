import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthProvider } from '../enums';

@Injectable()
export class MicrosoftAuthGuard extends AuthGuard(AuthProvider.Microsoft) {}
