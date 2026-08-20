import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { RpcException } from "@nestjs/microservices"
import type { Account } from "@orm/generated/client"
import { RpcStatus } from "@qb1tycinema/common"
import type {
	RefreshRequest,
	RefreshResponse,
	SendOtpRequest,
	SendOtpResponse,
	VerifyOtpRequest,
	VerifyOtpResponse
} from "@qb1tycinema/contracts/gen/auth"
import { PassportService, type TokenPayload } from "@qb1tycinema/passport"

import { OtpService } from "../otp/otp.service"

import { AuthRepository } from "./auth.repository"
import type { AllConfigs } from "@/config"

@Injectable()
export class AuthService {
	private readonly ACCESS_TOKEN_TTL: number
	private readonly REFRESH_TOKEN_TTL: number

	public constructor(
		private readonly config: ConfigService<AllConfigs>,
		private readonly authRepository: AuthRepository,
		private readonly otpService: OtpService,
		private readonly passportService: PassportService
	) {
		this.ACCESS_TOKEN_TTL = this.config.get("passport.accessTtl", {
			infer: true
		})
		this.REFRESH_TOKEN_TTL = this.config.get("passport.refreshTtl", {
			infer: true
		})
	}

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

		return this.generateTokens(account.id)
	}

	public async refresh(data: RefreshRequest): Promise<RefreshResponse> {
		const { refreshToken } = data

		const { valid, reason, userId } =
			this.passportService.verify(refreshToken)

		if (!valid) {
			throw new RpcException({
				code: RpcStatus.UNAUTHENTICATED,
				details: reason
			})
		}

		return this.generateTokens(userId)
	}

	private generateTokens(userId: string) {
		const payload: TokenPayload = { sub: userId }

		const access = this.passportService.generate(
			String(payload.sub),
			this.ACCESS_TOKEN_TTL
		)

		const refresh = this.passportService.generate(
			String(payload.sub),
			this.REFRESH_TOKEN_TTL
		)

		return {
			accessToken: access,
			refreshToken: refresh
		}
	}
}
