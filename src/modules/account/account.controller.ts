import { Controller } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import type {
	GetAccountRequest,
	GetAccountResponse
} from "@qb1tycinema/contracts/gen/account"

import { AccountService } from "./account.service"

@Controller()
export class AccountController {
	public constructor(private readonly accountService: AccountService) {}

	@GrpcMethod("AccountService", "GetAccount")
	public async getAccount(
		data: GetAccountRequest
	): Promise<GetAccountResponse> {
		return await this.accountService.getAccount(data)
	}
}
