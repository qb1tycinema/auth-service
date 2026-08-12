import { Injectable } from "@nestjs/common"
import type { Account } from "@orm/generated/client"
import { AccountCreateInput } from "@orm/generated/models"

import { PrismaService } from "@/infrastructure/prisma/prisma.service"

@Injectable()
export class AuthRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async findByPhone(phone: string): Promise<Account | null> {
		return await this.prisma.account.findUnique({ where: { phone } })
	}

	public async findByEmail(email: string): Promise<Account | null> {
		return await this.prisma.account.findUnique({ where: { email } })
	}

	public async createAccount(
		data: AccountCreateInput
	): Promise<Account | null> {
		return await this.prisma.account.create({ data })
	}
}
