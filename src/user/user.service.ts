import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const UserSelect = Prisma.validator<Prisma.UserSelect>()({
    userId: true,
    userGuid: true,
    email: true,
    name: true,
    phone: true,
    role: true,
    createdAt: true,
    updatedAt: true,
});
@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.user.findMany({
            select: UserSelect,
        });
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { userId: id },
            select: UserSelect,
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async getMyProfile(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { userId },
            select: UserSelect,
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        return user;
    }
}
