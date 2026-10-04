import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportService, type TokenPayload } from "@qb1tycinema/passport"
import { PinoLogger } from "nestjs-pino"

import type { AllConfigs } from "@/config"

@Injectable()
export class TokenService {
	private readonly ACCESS_TOKEN_TTL: number
	private readonly REFRESH_TOKEN_TTL: number

	public constructor(
		private readonly logger: PinoLogger,
		private readonly config: ConfigService<AllConfigs>,
		private readonly passportService: PassportService
	) {
		this.logger.setContext(TokenService.name)

		this.ACCESS_TOKEN_TTL = this.config.get("passport.accessTtl", {
			infer: true
		})
		this.REFRESH_TOKEN_TTL = this.config.get("passport.refreshTtl", {
			infer: true
		})
	}

	public generate(userId: string) {
		this.logger.debug(
			{ userId },
			"Generating new access and refresh tokens"
		)

		const payload: TokenPayload = { sub: userId }

		const access = this.passportService.generate(
			String(payload.sub),
			this.ACCESS_TOKEN_TTL
		)

		const refresh = this.passportService.generate(
			String(payload.sub),
			this.REFRESH_TOKEN_TTL
		)

		this.logger.info({ userId }, "Tokens generated successfully")

		return {
			accessToken: access,
			refreshToken: refresh
		}
	}

	public verify(token: string) {
		this.logger.debug("Attempting to verify token")

		const result = this.passportService.verify(token)

		if (result.valid) {
			this.logger.info(
				{ userId: result.userId },
				"Token verified successfully"
			)
		} else {
			this.logger.warn(
				{ reason: result.reason },
				"Token verification failed"
			)
		}

		return result
	}
}
