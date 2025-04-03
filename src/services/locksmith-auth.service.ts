import { AuthProvider } from '../enums';

export interface ILocksmithAuthService {
  login(user: string, pass: string): Promise<boolean>;
  externalLogin(
    user: string,
    externalId: string,
    authProvider: AuthProvider,
  ): Promise<boolean>;
}
