import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { AdminRole } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  beforeEach(() => {
    prisma = {
      adminUser: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    service = new AuthService(prisma, jwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('successfully logs in active admin with correct password', async () => {
      const plainPassword = 'AdminPassword123!';
      const hash = await argon2.hash(plainPassword);

      prisma.adminUser.findUnique.mockResolvedValue({
        id: 'admin-uuid',
        name: 'Super Admin',
        email: 'admin@techgadgets.lk',
        passwordHash: hash,
        role: AdminRole.SUPER_ADMIN,
        isActive: true,
        createdAt: new Date(),
      });

      prisma.adminUser.update.mockResolvedValue({});
      prisma.auditLog.create.mockResolvedValue({});

      const result = await service.login({
        email: 'admin@techgadgets.lk',
        password: plainPassword,
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.admin.email).toBe('admin@techgadgets.lk');
      expect(result.admin.role).toBe(AdminRole.SUPER_ADMIN);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'admin-uuid',
        email: 'admin@techgadgets.lk',
        role: AdminRole.SUPER_ADMIN,
      });
    });

    it('rejects invalid email with UnauthorizedException', async () => {
      prisma.adminUser.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'unknown@example.com',
          password: 'some-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects wrong password with UnauthorizedException', async () => {
      const hash = await argon2.hash('CorrectPassword123!');

      prisma.adminUser.findUnique.mockResolvedValue({
        id: 'admin-uuid',
        name: 'Admin',
        email: 'admin@techgadgets.lk',
        passwordHash: hash,
        role: AdminRole.ADMIN,
        isActive: true,
      });

      await expect(
        service.login({
          email: 'admin@techgadgets.lk',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects deactivated admin account', async () => {
      const plainPassword = 'Password123!';
      const hash = await argon2.hash(plainPassword);

      prisma.adminUser.findUnique.mockResolvedValue({
        id: 'admin-uuid',
        name: 'Deactivated Admin',
        email: 'deactivated@techgadgets.lk',
        passwordHash: hash,
        role: AdminRole.ADMIN,
        isActive: false, // Inactive!
      });

      await expect(
        service.login({
          email: 'deactivated@techgadgets.lk',
          password: plainPassword,
        }),
      ).rejects.toThrow('Admin account has been deactivated');
    });
  });
});
