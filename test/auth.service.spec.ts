import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      phone: '1234567890',
    };

    const mockRole = {
      roleId: 1,
      name: 'CUSTOMER',
      description: 'Customer role',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUser = {
      userId: 1,
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedPassword',
      phone: '1234567890',
      roleId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: mockRole,
    };

    it('should successfully register a new user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue(mockRole);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(prismaService.role.findUnique).toHaveBeenCalledWith({
        where: { name: 'CUSTOMER' },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          name: registerDto.name,
          password: 'hashedPassword',
          phone: registerDto.phone,
          roleId: mockRole.roleId,
        },
        include: {
          role: true,
        },
      });
      expect(result).toEqual({
        user: {
          userId: mockUser.userId,
          email: mockUser.email,
          name: mockUser.name,
          phone: mockUser.phone,
          roleId: mockUser.roleId,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
          role: mockRole,
        },
        token: 'jwt-token',
      });
      expect(result.user.password).toBeUndefined();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        new ConflictException('Email already registered'),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if customer role not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.role.findUnique.mockResolvedValue(null);

      await expect(service.register(registerDto)).rejects.toThrow(
        new BadRequestException('Customer role not found'),
      );
      expect(prismaService.role.findUnique).toHaveBeenCalledWith({
        where: { name: 'CUSTOMER' },
      });
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockRole = {
      roleId: 1,
      name: 'CUSTOMER',
      description: 'Customer role',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUser = {
      userId: 1,
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedPassword',
      phone: '1234567890',
      roleId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: mockRole,
    };

    it('should successfully login with valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        include: {
          role: true,
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result).toEqual({
        user: {
          userId: mockUser.userId,
          email: mockUser.email,
          name: mockUser.name,
          phone: mockUser.phone,
          roleId: mockUser.roleId,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
          role: mockRole,
        },
        token: 'jwt-token',
      });
      expect(result.user.password).toBeUndefined();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
        include: {
          role: true,
        },
      });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    const mockRole = {
      roleId: 1,
      name: 'CUSTOMER',
      description: 'Customer role',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUser = {
      userId: 1,
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedPassword',
      phone: '1234567890',
      roleId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: mockRole,
    };

    it('should validate and return user without password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(1);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          role: true,
        },
      });
      expect(result.password).toBeUndefined();
      expect(result.userId).toBe(mockUser.userId);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser(999)).rejects.toThrow(
        new UnauthorizedException('User not found'),
      );
    });
  });

  describe('getProfile', () => {
    const mockRole = {
      roleId: 1,
      name: 'CUSTOMER',
      description: 'Customer role',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUser = {
      userId: 1,
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedPassword',
      phone: '1234567890',
      roleId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: mockRole,
    };

    it('should return user profile without password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile(1);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          role: true,
        },
      });
      expect(result.password).toBeUndefined();
      expect(result.userId).toBe(mockUser.userId);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(
        new UnauthorizedException('User not found'),
      );
    });
  });
});