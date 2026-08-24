import { Injectable } from "@nestjs/common"
import type { Account } from "@orm/generated/client"

import { PrismaService } from "@/infrastructure/prisma/prisma.service"

@Injectable()
export class TelegramRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public async findByTelegramId(telegramId: string): Promise<Account | null> {
		return await this.prisma.account.findUnique({
			where: {
				telegramId: telegramId
			}
		})
	}
}
