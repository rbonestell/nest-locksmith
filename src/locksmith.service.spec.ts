import { Test, TestingModule } from '@nestjs/testing';
import { LocksmithService } from './locksmith.service';

describe('LocksmithService', () => {
  let service: LocksmithService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocksmithService],
    }).compile();

    service = module.get<LocksmithService>(LocksmithService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
