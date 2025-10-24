import { Controller, Get, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ResponseUtil } from 'src/common/utils/response.util';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  // Admin only route
  @Get()
  @Roles('ADMIN')
  async findAll() {
    const results = await this.userService.findAll();
    return ResponseUtil.success(results, 'Users retrieved successfully');
  }

  // Authenticated users can get their own profile
  @Get('me')
  async getMyProfile(@GetUser('userId') userId: number) {
    const result = await this.userService.getMyProfile(userId);
    return ResponseUtil.success(result, 'User profile retrieved successfully');
  }

  // Admin can view any user
  @Get(':id')
  @Roles('ADMIN')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.userService.findOne(id);
    return ResponseUtil.success(result, 'User retrieved successfully');
  }
}