import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { PrismaService } from '../prisma/prisma.service';
  import * as bcrypt from 'bcrypt';
  import { LoginDto, RegisterDto } from './dto/index';
  import { User } from '@prisma/client';
  
  @Injectable()
  export class AuthService {
    constructor(
      private prisma: PrismaService,
      private jwtService: JwtService,
    ) {}
  
    async register(dto: RegisterDto) {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
  
      if (existingUser) {
        throw new ConflictException('Email already registered');
      }
  
      // Get customer role
      const customerRole = await this.prisma.role.findUnique({
        where: { name: 'CUSTOMER' },
      });
  
      if (!customerRole) {
        throw new BadRequestException('Customer role not found');
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(dto.password, 10);
  
      // Create user
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          password: hashedPassword,
          phone: dto.phone,
          roleId: customerRole.roleId,
        },
        include: {
          role: true,
        },
      });
  
      // Generate token
      const token = await this.generateToken(user);
  
      return {
        user: this.sanitizeUser(user),
        token,
      };
    }
  
    async login(dto: LoginDto) {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        include: {
          role: true,
        },
      });
  
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      // Verify password
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
  
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
  
      // Generate token
      const token = await this.generateToken(user);
  
      return {
        user: this.sanitizeUser(user),
        token,
      };
    }
  
    async validateUser(userId: number) {
      const user = await this.prisma.user.findUnique({
        where: { userId },
        include: {
          role: true,
        },
      });
  
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
  
      return this.sanitizeUser(user);
    }
  
    private async generateToken(user: User): Promise<string> {
      const payload = {
        sub: user.userId,
        email: user.email,
        roleId: user.roleId,
      };
  
      return this.jwtService.sign(payload);
    }
  
    private sanitizeUser(user: any) {
      const { password, ...sanitized } = user;
      return sanitized;
    }
  
    async getProfile(userId: number) {
      const user = await this.prisma.user.findUnique({
        where: { userId },
        include: {
          role: true,
        },
      });
  
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
  
      return this.sanitizeUser(user);
    }
  }