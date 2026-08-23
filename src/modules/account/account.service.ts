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

import { OtpService } from "../otp/otp.service"

import { AccountRepository } from "./account.repository"
import { UserRepository } from "@/shared/repositories"

@Injectable()
export class AccountService {
	public constructor(
		private readonly accountRepository: AccountRepository,
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService
	) {}

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

	public async initEmailChange(
		data: InitEmailChangeRequest
	): Promise<InitEmailChangeResponse> {
		const { email, userId } = data

		const existing = await this.userRepository.findByEmail(email)

		if (existing) {
			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				details: "Email already in use"
			})
		}

		const { code, hash } = await this.otpService.send(email, "email")

		console.log(code)

		await this.accountRepository.upsertPendingChange({
			accountId: userId,
			type: "email",
			value: email,
			codeHash: hash,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000)
		})

		return {
			ok: true
		}
	}

	public async confirmEmailChange(
		data: ConfirmEmailChangeRequest
	): Promise<ConfirmEmailChangeResponse> {
		const { email, code, userId } = data

		const pending = await this.accountRepository.findPendingChange(
			userId,
			"email"
		)

		if (!pending) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "No pending request"
			})
		}

		if (pending.value !== email) {
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: "Email mismatch"
			})
		}

		if (pending.expiresAt < new Date()) {
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

		return {
			ok: true
		}
	}

	public async initPhoneChange(
		data: InitPhoneChangeRequest
	): Promise<InitPhoneChangeResponse> {
		const { phone, userId } = data

		const existing = await this.userRepository.findByPhone(phone)

		if (existing) {
			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				details: "Phone already in use"
			})
		}

		const { code, hash } = await this.otpService.send(phone, "phone")

		console.log(code)

		await this.accountRepository.upsertPendingChange({
			accountId: userId,
			type: "phone",
			value: phone,
			codeHash: hash,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000)
		})

		return {
			ok: true
		}
	}

	public async confirmPhoneChange(
		data: ConfirmPhoneChangeRequest
	): Promise<ConfirmPhoneChangeResponse> {
		const { phone, code, userId } = data

		const pending = await this.accountRepository.findPendingChange(
			userId,
			"phone"
		)

		if (!pending) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "No pending request"
			})
		}

		if (pending.value !== phone) {
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: "Email mismatch"
			})
		}

		if (pending.expiresAt < new Date()) {
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

		return {
			ok: true
		}
	}
}
