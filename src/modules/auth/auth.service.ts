import { Injectable } from "@nestjs/common"
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
import { lastValueFrom } from "rxjs"

import { OtpService } from "../otp/otp.service"
import { TokenService } from "../token/token.service"
import { UsersClientGrpc } from "../users/users.grpc"

import { MessagingService } from "@/infrastructure/messaging/messaging.service"
import { UserRepository } from "@/shared/repositories"

@Injectable()
export class AuthService {
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService,
		private readonly tokenService: TokenService,
		private readonly messagingService: MessagingService,
		private readonly usersClient: UsersClientGrpc
	) {}

	public async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		const { identifier, type } = data

		let account!: Account | null

		if (type === "phone") {
			account = await this.userRepository.findByPhone(identifier)
		} else if (type === "email") {
			account = await this.userRepository.findByEmail(identifier)
		}

		if (!account) {
			account = await this.userRepository.createAccount({
				email: type === "email" ? identifier : undefined,
				phone: type === "phone" ? identifier : undefined
			})
		}

		const { code } = await this.otpService.send(
			identifier,
			type as "phone" | "email"
		)

		await this.messagingService.otpRequested({ identifier, type, code })

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
			account = await this.userRepository.findByPhone(identifier)
		} else if (type === "email") {
			account = await this.userRepository.findByEmail(identifier)
		}

		if (!account) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "Account not found"
			})
		}

		if (type === "phone" && !account.isPhoneVerified) {
			await this.userRepository.update(account.id, {
				isPhoneVerified: true
			})
		}

		if (type === "email" && !account.isEmailVerified) {
			await this.userRepository.update(account.id, {
				isEmailVerified: true
			})
		}

		this.usersClient.create({ id: account.id }).subscribe()

		return this.tokenService.generate(account.id)
	}

	public async refresh(data: RefreshRequest): Promise<RefreshResponse> {
		const { refreshToken } = data

		const { valid, reason, userId } = this.tokenService.verify(refreshToken)

		if (!valid) {
			throw new RpcException({
				code: RpcStatus.UNAUTHENTICATED,
				details: reason
			})
		}

		return this.tokenService.generate(userId)
	}
}
