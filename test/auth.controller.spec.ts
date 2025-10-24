import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
      phone: '1234567890',
    };

    const mockResponse = {
      user: {
        userId: 1,
        email: 'test@example.com',
        name: 'Test User',
        phone: '1234567890',
        roleId: 1,
      },
      token: 'jwt-token',
    };

    it('should register a new user successfully', async () => {
      mockAuthService.register.mockResolvedValue(mockResponse);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        success: true,
        statusCode: 201,
        message: 'User registered successfully',
        data: mockResponse,
      });
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Email already registered');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(registerDto)).rejects.toThrow(error);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockResponse = {
      user: {
        userId: 1,
        email: 'test@example.com',
        name: 'Test User',
        roleId: 1,
      },
      token: 'jwt-token',
    };

    it('should login user successfully', async () => {
      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'User logged in successfully',
        data: mockResponse,
      });
    });

    it('should propagate errors from service', async () => {
      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(error);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getProfile', () => {
    const mockUser = {
      userId: 1,
      email: 'test@example.com',
      name: 'Test User',
      roleId: 1,
    };

    it('should return user profile successfully', async () => {
      mockAuthService.getProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile(1);

      expect(authService.getProfile).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'User profile retrieved successfully',
        data: mockUser,
      });
    });

    it('should propagate errors from service', async () => {
      const error = new Error('User not found');
      mockAuthService.getProfile.mockRejectedValue(error);

      await expect(controller.getProfile(999)).rejects.toThrow(error);
      expect(authService.getProfile).toHaveBeenCalledWith(999);
    });
  });
});