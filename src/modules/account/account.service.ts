import { Injectable } from "@nestjs/common"
import { RpcException } from "@nestjs/microservices"
import { convertEnum, RpcStatus } from "@qb1tycinema/common"
import {
	type ConfirmEmailChangeRequest,
	type ConfirmEmailChangeResponse,
	type ConfirmPhoneChangeRequest,
	type ConfirmPhoneChangeResponse,
	type GetAccountRequest,
	type GetAccountResponse,
	type InitEmailChangeRequest,
	type InitEmailChangeResponse,
	type InitPhoneChangeRequest,
	type InitPhoneChangeResponse,
	Role
} from "@qb1tycinema/contracts/gen/account"
import { PinoLogger } from "nestjs-pino"

import { OtpService } from "../otp/otp.service"

import { AccountRepository } from "./account.repository"
import { MessagingService } from "@/infrastructure/messaging/messaging.service"
import { UserRepository } from "@/shared/repositories"

@Injectable()
export class AccountService {
	public constructor(
		private readonly logger: PinoLogger,
		private readonly messagingService: MessagingService,
		private readonly accountRepository: AccountRepository,
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService
	) {
		this.logger.setContext(AccountService.name)
	}

	public async getAccount(
		data: GetAccountRequest
	): Promise<GetAccountResponse> {
		const { id } = data

		this.logger.debug({ accountId: id }, "Fetching account details")

		const account = await this.accountRepository.findById(id)

		if (!account) {
			this.logger.warn({ accountId: id }, "Account not found")

			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "Account not found"
			})
		}

		const { createdAt, updatedAt, ...result } = account

		this.logger.info(
			{ accountId: id },
			"Account details fetched successfully"
		)

		return { ...result, role: convertEnum(Role, account.role) }
	}

	public async initEmailChange(
		data: InitEmailChangeRequest
	): Promise<InitEmailChangeResponse> {
		const { email, userId } = data

		this.logger.info({ userId, email }, "Initializing email change request")

		const existing = await this.userRepository.findByEmail(email)

		if (existing) {
			this.logger.warn(
				{ userId, email },
				"Email change failed: email already in use"
			)

			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				details: "Email already in use"
			})
		}

		const { code, hash } = await this.otpService.send(email, "email")

		await this.messagingService.emailChange({ email, code })

		await this.accountRepository.upsertPendingChange({
			accountId: userId,
			type: "email",
			value: email,
			codeHash: hash,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000)
		})

		this.logger.info(
			{ userId, email },
			"Email change initialized and OTP sent"
		)

		return {
			ok: true
		}
	}

	public async confirmEmailChange(
		data: ConfirmEmailChangeRequest
	): Promise<ConfirmEmailChangeResponse> {
		const { email, code, userId } = data

		this.logger.info({ userId, email }, "Confirming email change")

		const pending = await this.accountRepository.findPendingChange(
			userId,
			"email"
		)

		if (!pending) {
			this.logger.warn(
				{ userId, email },
				"No pending email change request found"
			)

			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "No pending request"
			})
		}

		if (pending.value !== email) {
			this.logger.warn(
				{ userId, requestedEmail: email, pendingEmail: pending.value },
				"Email change confirmation failed: email mismatch"
			)

			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: "Email mismatch"
			})
		}

		if (pending.expiresAt < new Date()) {
			this.logger.warn(
				{ userId, email },
				"Email change confirmation failed: code expired"
			)

			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "Code expired"
			})
		}

		this.otpService.verify(pending.value, code, "email")

		await this.userRepository.update(userId, {
			email,
			isEmailVerified: true
		})

		await this.accountRepository.deletePendingChange(userId, "email")

		this.logger.info({ userId, email }, "Email changed successfully")

		return {
			ok: true
		}
	}

	public async initPhoneChange(
		data: InitPhoneChangeRequest
	): Promise<InitPhoneChangeResponse> {
		const { phone, userId } = data

		this.logger.info({ userId, phone }, "Initializing phone change request")

		const existing = await this.userRepository.findByPhone(phone)

		if (existing) {
			this.logger.warn(
				{ userId, phone },
				"Phone change failed: phone already in use"
			)

			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				details: "Phone already in use"
			})
		}

		const { code, hash } = await this.otpService.send(phone, "phone")

		await this.messagingService.phoneChange({ phone, code })

		await this.accountRepository.upsertPendingChange({
			accountId: userId,
			type: "phone",
			value: phone,
			codeHash: hash,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000)
		})

		this.logger.info(
			{ userId, phone },
			"Phone change initialized and OTP sent"
		)

		return {
			ok: true
		}
	}

	public async confirmPhoneChange(
		data: ConfirmPhoneChangeRequest
	): Promise<ConfirmPhoneChangeResponse> {
		const { phone, code, userId } = data

		this.logger.info({ userId, phone }, "Confirming phone change")

		const pending = await this.accountRepository.findPendingChange(
			userId,
			"phone"
		)

		if (!pending) {
			this.logger.warn(
				{ userId, phone },
				"No pending phone change request found"
			)

			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "No pending request"
			})
		}

		if (pending.value !== phone) {
			this.logger.warn(
				{ userId, requestedPhone: phone, pendingPhone: pending.value },
				"Phone change confirmation failed: phone mismatch"
			)

			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: "Email mismatch"
			})
		}

		if (pending.expiresAt < new Date()) {
			this.logger.warn(
				{ userId, phone },
				"Phone change confirmation failed: code expired"
			)

			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "Code expired"
			})
		}

		this.otpService.verify(pending.value, code, "phone")

		await this.userRepository.update(userId, {
			phone,
			isPhoneVerified: true
		})

		await this.accountRepository.deletePendingChange(userId, "phone")

		this.logger.info({ userId, phone }, "Phone changed successfully")

		return {
			ok: true
		}
	}
}
