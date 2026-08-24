import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportService, type TokenPayload } from "@qb1tycinema/passport"

import type { AllConfigs } from "@/config"

@Injectable()
export class TokenService {
	private readonly ACCESS_TOKEN_TTL: number
	private readonly REFRESH_TOKEN_TTL: number

	public constructor(
		private readonly config: ConfigService<AllConfigs>,
		private readonly passportService: PassportService
	) {
		this.ACCESS_TOKEN_TTL = this.config.get("passport.accessTtl", {
			infer: true
		})
		this.REFRESH_TOKEN_TTL = this.config.get("passport.refreshTtl", {
			infer: true
		})
	}

	public generate(userId: string) {
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

	public verify(token: string) {
		return this.passportService.verify(token)
	}
}
