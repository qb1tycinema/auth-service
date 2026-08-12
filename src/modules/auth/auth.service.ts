import { Injectable, NotFoundException } from "@nestjs/common"
import type { Account } from "@orm/generated/client"
import type {
	SendOtpRequest,
	SendOtpResponse
} from "@qb1tycinema/contracts/gen/auth"

import { AuthRepository } from "./auth.repository"

@Injectable()
export class AuthService {
	public constructor(private readonly authRepository: AuthRepository) {}

	public async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		const { identifier, type } = data

		let account!: Account | null

		if (type === "phone") {
			account = await this.authRepository.findByPhone(identifier)
		} else if (type === "email") {
			account = await this.authRepository.findByEmail(identifier)
		}

		if (!account) {
			account = await this.authRepository.createAccount({
				email: type === "email" ? identifier : undefined,
				phone: type === "phone" ? identifier : undefined
			})
		}

		return {
			ok: true
		}
	}
}
