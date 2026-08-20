import { Injectable } from '@nestjs/common';
import { Role, type GetAccountRequest, type GetAccountResponse } from '@qb1tycinema/contracts/gen/account';
import { AccountRepository } from './account.repository';
import { RpcException } from '@nestjs/microservices';
import { RpcStatus, convertEnum } from '@qb1tycinema/common';

@Injectable()
export class AccountService {
    public constructor(private readonly accountRepository: AccountRepository) {}

    public async getAccount(data: GetAccountRequest): Promise<GetAccountResponse> {
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
