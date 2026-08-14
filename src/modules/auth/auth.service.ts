import { Injectable } from "@nestjs/common"
import { RpcException } from "@nestjs/microservices"
import type { Account } from "@orm/generated/client"
import { RpcStatus } from "@qb1tycinema/common"
import type {
	SendOtpRequest,
	SendOtpResponse,
	VerifyOtpRequest,
	VerifyOtpResponse
} from "@qb1tycinema/contracts/gen/auth"

import { OtpService } from "../otp/otp.service"

import { AuthRepository } from "./auth.repository"

@Injectable()
export class AuthService {
	public constructor(
		private readonly authRepository: AuthRepository,
		private readonly otpService: OtpService
	) {}

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

		const code = await this.otpService.send(
			identifier,
			type as "phone" | "email"
		)

		console.log(code)

		return {
			ok: true
		}
	}

	public async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
		const { identifier, code, type } = data

		await this.otpService.verify(
			identifier,
			code,
			type as "email" | "phone"
		)

		let account!: Account | null

		if (type === "phone") {
			account = await this.authRepository.findByPhone(identifier)
		} else if (type === "email") {
			account = await this.authRepository.findByEmail(identifier)
		}

		if (!account) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "Account not found"
			})
		}

		if (type === "phone" && !account.isPhoneVerified) {
			await this.authRepository.update(account.id, {
				isPhoneVerified: true
			})
		}

		if (type === "email" && !account.isEmailVerified) {
			await this.authRepository.update(account.id, {
				isEmailVerified: true
			})
		}

		return {
			accessToken: "123456",
			refreshToken: "123456"
		}
	}
}
