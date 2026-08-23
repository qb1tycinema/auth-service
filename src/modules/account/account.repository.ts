import { Injectable } from "@nestjs/common"
import type { Account, PendingContactChange } from "@orm/generated/client"

import { PrismaService } from "@/infrastructure/prisma/prisma.service"

@Injectable()
export class AccountRepository {
	public constructor(private readonly prisma: PrismaService) {}

	public findById(id: string): Promise<Account | null> {
		return this.prisma.account.findUnique({ where: { id } })
	}

	public findPendingChange(
		accountId: string,
		type: "email" | "phone"
	): Promise<PendingContactChange> {
		return this.prisma.pendingContactChange.findUnique({
			where: {
				accountId_type: {
					accountId: accountId,
					type: type
				}
			}
		})
	}

	public upsertPendingChange(data: {
		accountId: string
		type: "email" | "phone"
		value: string
		codeHash: string
		expiresAt: Date
	}): Promise<PendingContactChange> {
		return this.prisma.pendingContactChange.upsert({
			where: {
				accountId_type: {
					accountId: data.accountId,
					type: data.type
				}
			},
			create: data,
			update: data
		})
	}

	public deletePendingChange(
		accountId: string,
		type: "email" | "phone"
	): Promise<PendingContactChange> {
		return this.prisma.pendingContactChange.delete({
			where: {
				accountId_type: {
					accountId: accountId,
					type: type
				}
			}
		})
	}
}
