import { registerAs } from "@nestjs/config"

import { PassportValidator } from "../validators"

import { validateEnv } from "@/shared/utils"

export const passportEnv = registerAs("passport", () => {
	validateEnv(process.env, PassportValidator)

	return {
		secretKey: process.env.TOKEN_SECRET_KEY,
		accessTtl: parseInt(process.env.TOKEN_ACCESS_TTL),
		refreshTtl: parseInt(process.env.TOKEN_REFRESH_TTL)
	}
})
