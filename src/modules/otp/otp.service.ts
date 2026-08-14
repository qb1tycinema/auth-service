import { Injectable } from "@nestjs/common"
import { RpcException } from "@nestjs/microservices"
import { RpcStatus } from "@qb1tycinema/common"
import { createHash } from "node:crypto"
import { generateCode as generate } from "patcode"

import { RedisService } from "@/infrastructure/redis/redis.service"

@Injectable()
export class OtpService {
	public constructor(private readonly redis: RedisService) {}

	public async send(identifier: string, type: "phone" | "email") {
		const { code, hash } = this.generateCode()

		await this.redis.set(`otp:${type}:${identifier}`, hash, "EX", 300)

		return code
	}

	public async verify(
		identifier: string,
		code: string,
		type: "phone" | "email"
	) {
		const storedHash = await this.redis.get(`otp:${type}:${identifier}`)

		if (!storedHash) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "Invalid or expired code"
			})
		}

		const incomingHash = createHash("sha256").update(code).digest("hex")

		if (storedHash !== incomingHash) {
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: "Invalid or expired code"
			})
		}

		await this.redis.del(`otp:${type}:${identifier}`)
	}

	private generateCode() {
		const code = generate()
		const hash = createHash("sha256").update(code).digest("hex")

		return { code, hash }
	}
}
