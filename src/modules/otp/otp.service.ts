import { Injectable } from "@nestjs/common"
import { RpcException } from "@nestjs/microservices"
import { RpcStatus } from "@qb1tycinema/common"
import { PinoLogger } from "nestjs-pino"
import { createHash } from "node:crypto"
import { generateCode as generate } from "patcode"

import { RedisService } from "@/infrastructure/redis/redis.service"

@Injectable()
export class OtpService {
	public constructor(
		private readonly logger: PinoLogger,
		private readonly redis: RedisService
	) {
		this.logger.setContext(OtpService.name)
	}

	public async send(identifier: string, type: "phone" | "email") {
		this.logger.debug({ identifier, type }, "Generating new OTP")

		const { code, hash } = this.generateCode()

		await this.redis.set(`otp:${type}:${identifier}`, hash, "EX", 300)

		this.logger.info(
			{ identifier, type },
			"OTP hash successfully stored in Redis"
		)

		return { code, hash }
	}

	public async verify(
		identifier: string,
		code: string,
		type: "phone" | "email"
	) {
		this.logger.debug({ identifier, type }, "Attempting to verify OTP")

		const storedHash = await this.redis.get(`otp:${type}:${identifier}`)

		if (!storedHash) {
			this.logger.warn(
				{ identifier, type },
				"OTP verification failed: code not found or expired in Redis"
			)

			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "Invalid or expired code"
			})
		}

		const incomingHash = createHash("sha256").update(code).digest("hex")

		if (storedHash !== incomingHash) {
			this.logger.warn(
				{ identifier, type },
				"OTP verification failed: hash mismatch (wrong code)"
			)

			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "Invalid or expired code"
			})
		}

		await this.redis.del(`otp:${type}:${identifier}`)

		this.logger.info(
			{ identifier, type },
			"OTP verified successfully and removed from Redis"
		)
	}

	private generateCode() {
		const code = generate()
		const hash = createHash("sha256").update(code).digest("hex")

		return { code, hash }
	}
}
