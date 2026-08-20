import { Injectable } from "@nestjs/common"
import type { Account } from "@orm/generated/client"

import { PrismaService } from "@/infrastructure/prisma/prisma.service"

@Injectable()
export class AccountRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public findById(id: string): Promise<Account | null> {
		return this.prisma.account.findUnique({ where: { id } })
	}
}
