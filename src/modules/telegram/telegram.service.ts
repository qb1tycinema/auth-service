import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { RpcException } from "@nestjs/microservices"
import type { TelegramVerifyRequest } from "@qb1tycinema/contracts/gen/auth"
import { createHash, createHmac, randomBytes } from "crypto"

import { TokenService } from "../token/token.service"

import { TelegramRepository } from "./telegram.repository"
import type { AllConfigs } from "@/config"
import { RedisService } from "@/infrastructure/redis/redis.service"
import { RpcStatus } from "@qb1tycinema/common"

@Injectable()
export class TelegramService {
	private readonly BOT_ID: string
	private readonly BOT_TOKEN: string
	private readonly BOT_USERNAME: string
	private readonly REDIRECT_ORIGIN: string

	public constructor(
		private readonly redisService: RedisService,
		private readonly config: ConfigService<AllConfigs>,
		private readonly telegramRepository: TelegramRepository,
		private readonly tokenService: TokenService
	) {
		this.BOT_ID = config.get("telegram.botId", { infer: true })
		this.BOT_TOKEN = config.get("telegram.botToken", { infer: true })
		this.BOT_USERNAME = config.get("telegram.botUsername", { infer: true })
		this.REDIRECT_ORIGIN = config.get("telegram.redirectOrigin", {
			infer: true
		})
	}

	public getAuthUrl() {
		const url = new URL("https://oauth.telegram.org/auth")

		url.searchParams.append("bot_id", this.BOT_ID)
		url.searchParams.append("origin", this.REDIRECT_ORIGIN)
		url.searchParams.append("request_access", "write")
		url.searchParams.append("return_to", this.REDIRECT_ORIGIN)

		return {
			url: url.href
		}
	}

	public async verify(data: TelegramVerifyRequest) {
		const isValid = this.checkTelegramAuth(data.query)

		if (!isValid) {
			throw new RpcException({
				code: RpcStatus.UNAUTHENTICATED,
				details: "Invalid Telegram signature"
			})
		}

		const authDate = parseInt(data.query.auth_date, 10)
		const now = Math.floor(Date.now() / 1000)

		if (now - authDate > 300) {
			throw new RpcException({
                code: RpcStatus.UNAUTHENTICATED,
                details: "Telegram authentication data has expired"
            })
		}

		const telegramId = String(data.query.id)

		const account =
			await this.telegramRepository.findByTelegramId(telegramId)

		if (account && account.phone) {
			return this.tokenService.generate(account.id)
		}

		const sessionId = randomBytes(16).toString("hex")


		await this.redisService.set(
			`telegram_session:${sessionId}`,
			JSON.stringify({
				telegramId,
				username: data.query.username,
				firstname: data.query?.first_name ?? null,
				lastname: data.query?.last_name ?? null
			}),
			"EX",
			300
		)

		return {
			url: `https://t.me/${this.BOT_USERNAME}?start=${sessionId}`
		}
	}

	private checkTelegramAuth(query: Record<string, string>) {
		const hash = query.hash

		if (!hash) {
			return false
		}

		const dataCheckArr = Object.keys(query)
			.filter(key => key !== "hash")
			.sort()
			.map(key => `${key}=${query[key]}`)
			
		const dataCheckString = dataCheckArr.join("\n")

		const secretKey = createHash("sha256")
			.update(`${this.BOT_ID}:${this.BOT_TOKEN}`)
			.digest()

		const hmac = createHmac("sha256", secretKey)
			.update(dataCheckString)
			.digest("hex")

		const isValid = hmac === hash

		return isValid
	}
}
