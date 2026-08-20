import { Injectable } from "@nestjs/common"
import { RpcException } from "@nestjs/microservices"
import { convertEnum, RpcStatus } from "@qb1tycinema/common"
import {
	type GetAccountRequest,
	type GetAccountResponse,
	Role
} from "@qb1tycinema/contracts/gen/account"

import { AccountRepository } from "./account.repository"

@Injectable()
export class AccountService {
	public constructor(private readonly accountRepository: AccountRepository) {}

	public async getAccount(
		data: GetAccountRequest
	): Promise<GetAccountResponse> {
		const { id } = data

		const account = await this.accountRepository.findById(id)

		if (!account) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "Account not found"
			})
		}

		const { createdAt, updatedAt, ...result } = account

		return { ...result, role: convertEnum(Role, account.role) }
	}
}
