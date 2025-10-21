import { Controller, Get, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  // Admin only route
  @Get()
  @Roles('ADMIN')
  async findAll() {
    return { message: 'Get all users - Admin only' };
  }

  // Authenticated users can get their own profile
  @Get('me')
  async getMyProfile(@GetUser('userId') userId: number) {
    return { message: 'Your profile', userId };
  }

  // Public route example
  @Get('public')
  @Public()
  async publicRoute() {
    return { message: 'This is a public route' };
  }

  // Admin can view any user
  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return { message: `Get user ${id} - Admin only` };
  }
}