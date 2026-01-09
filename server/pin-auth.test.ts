import { describe, it, expect } from 'vitest';
import { appRouter } from './routers';

describe('PIN Authentication', () => {
  const caller = appRouter.createCaller({
    req: {} as any,
    res: {} as any,
    user: null,
  });

  it('should verify admin PIN correctly', async () => {
    const result = await caller.auth.verifyPin({
      pin: process.env.ADMIN_PIN || '1234',
      role: 'admin',
    });

    expect(result.valid).toBe(true);
    expect(result.role).toBe('admin');
  });

  it('should verify cashier PIN correctly', async () => {
    const result = await caller.auth.verifyPin({
      pin: process.env.CASHIER_PIN || '5678',
      role: 'cashier',
    });

    expect(result.valid).toBe(true);
    expect(result.role).toBe('cashier');
  });

  it('should reject invalid admin PIN', async () => {
    const result = await caller.auth.verifyPin({
      pin: '0000',
      role: 'admin',
    });

    expect(result.valid).toBe(false);
  });

  it('should reject invalid cashier PIN', async () => {
    const result = await caller.auth.verifyPin({
      pin: '9999',
      role: 'cashier',
    });

    expect(result.valid).toBe(false);
  });

  it('should reject PIN with wrong length', async () => {
    await expect(
      caller.auth.verifyPin({
        pin: '123',
        role: 'admin',
      })
    ).rejects.toThrow();
  });
});
