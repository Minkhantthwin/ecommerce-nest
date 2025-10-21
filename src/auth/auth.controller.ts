import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/index';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { ResponseUtil } from '../common/utils/response.util';   

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return ResponseUtil.created(result, 'User registered successfully');
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return ResponseUtil.success(result, 'User logged in successfully');
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetUser('userId') userId: number) {
    const result = await this.authService.getProfile(userId);
    return ResponseUtil.success(result, 'User profile retrieved successfully');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@GetUser() user: any) {
    return { user };
  }
}