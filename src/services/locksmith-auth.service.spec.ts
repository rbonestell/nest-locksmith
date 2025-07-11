import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AuthProvider } from '../enums';
import { JwtPayload } from '../strategies/jwt.strategy';
import { LocksmithAuthService } from './locksmith-auth.service';

describe('LocksmithAuthService', () => {
	it('creates tokens with default iss and jti', async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [JwtModule.register({ secret: 'test' })],
			providers: [
				LocksmithAuthService,
				{
					provide: 'LOCKSMITH_OPTIONS',
					useValue: { jwt: { issuerName: 'MyApp' } },
				},
			],
		}).compile();

		const service = moduleRef.get<LocksmithAuthService>(LocksmithAuthService);
		const jwtService = moduleRef.get(JwtService);

		const payload: JwtPayload = { sub: '1', username: 'bob' };
		const accessToken = await service.createAccessToken(payload);
		const decoded = jwtService.verify(accessToken);
		expect(decoded.iss).toBe('MyApp');
		expect(decoded.jti).toBeDefined();
	});

	it('createExternalAccessToken uses package.json name when issuer is missing', async () => {
		const fs = await import('fs');
		const os = await import('os');
		const path = await import('path');
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ls-'));
		fs.writeFileSync(
			path.join(tempDir, 'package.json'),
			JSON.stringify({ name: 'test-app' }),
		);
		const cwd = process.cwd();
		process.chdir(tempDir);

		const moduleRef = await Test.createTestingModule({
			imports: [JwtModule.register({ secret: 'test' })],
			providers: [
				LocksmithAuthService,
				{ provide: 'LOCKSMITH_OPTIONS', useValue: { jwt: {} } },
			],
		}).compile();

		const service = moduleRef.get<LocksmithAuthService>(LocksmithAuthService);
		const jwtService = moduleRef.get(JwtService);

		const payload: JwtPayload = { sub: '1', username: 'bob' };
		const accessToken = await service.createExternalAccessToken(
			payload,
			'ext',
			AuthProvider.Google,
		);
		const decoded = jwtService.verify(accessToken);
		expect(decoded.iss).toBe('test-app');
		expect(decoded.externalId).toBe('ext');
		expect(decoded.provider).toBe(AuthProvider.Google);

		process.chdir(cwd);
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	it('createExternalAccessToken omits issuer when package.json missing', async () => {
		const fs = await import('fs');
		const os = await import('os');
		const path = await import('path');
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ls-'));
		const cwd = process.cwd();
		process.chdir(tempDir);

		const moduleRef = await Test.createTestingModule({
			imports: [JwtModule.register({ secret: 'test' })],
			providers: [
				LocksmithAuthService,
				{ provide: 'LOCKSMITH_OPTIONS', useValue: { jwt: {} } },
			],
		}).compile();

		const service = moduleRef.get<LocksmithAuthService>(LocksmithAuthService);
		const jwtService = moduleRef.get(JwtService);
		const payload: JwtPayload = { sub: '1', username: 'alice' };
		const accessToken = await service.createExternalAccessToken(
			payload,
			'ext2',
			AuthProvider.Apple,
		);
		const decoded = jwtService.verify(accessToken);
		expect(decoded.iss).toBeUndefined();
		expect(decoded.provider).toBe(AuthProvider.Apple);

		process.chdir(cwd);
		fs.rmSync(tempDir, { recursive: true, force: true });
	});
});
