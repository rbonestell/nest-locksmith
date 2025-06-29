import { ExecutionContext } from '@nestjs/common';
import { GoogleAuthGuard } from './google-auth.guard';
import { MicrosoftAuthGuard } from './microsoft-auth.guard';
import { AppleAuthGuard } from './apple-auth.guard';
import * as passport from 'passport';

jest.mock('passport');

describe('OAuth Guards', () => {
        const makeContext = () => {
                const req: any = {};
                const res: any = { redirect: jest.fn() };
                const ctx: ExecutionContext = {
                        switchToHttp: () => ({
                                getRequest: () => req,
                                getResponse: () => res,
                        }),
                } as any;
                return { req, res, ctx };
        };

        beforeEach(() => {
                jest.resetAllMocks();
                (passport.authenticate as jest.Mock).mockImplementation(
                        (_type, _opts, _cb) => (req: any, res: any, next: () => void) => {
                                res.redirect('/oauth');
                                next();
                        },
                );
        });

        it('GoogleAuthGuard triggers redirect', async () => {
                const { res, ctx } = makeContext();
                await new GoogleAuthGuard().canActivate(ctx);
                expect(res.redirect).toHaveBeenCalledWith('/oauth');
        });

        it('MicrosoftAuthGuard triggers redirect', async () => {
                const { res, ctx } = makeContext();
                await new MicrosoftAuthGuard().canActivate(ctx);
                expect(res.redirect).toHaveBeenCalledWith('/oauth');
        });

        it('AppleAuthGuard triggers redirect', async () => {
                const { res, ctx } = makeContext();
                await new AppleAuthGuard().canActivate(ctx);
                expect(res.redirect).toHaveBeenCalledWith('/oauth');
        });
});
