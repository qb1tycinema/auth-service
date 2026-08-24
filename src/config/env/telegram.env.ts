import { registerAs } from "@nestjs/config"

import { TelegramValidator } from "../validators"

import { validateEnv } from "@/shared/utils"

export const telegramEnv = registerAs("telegram", () => {
	validateEnv(process.env, TelegramValidator)

	return {
		botId: process.env.TELEGRAM_BOT_ID,
		botToken: process.env.TELEGRAM_BOT_TOKEN,
		botUsername: process.env.TELEGRAM_BOT_USERNAME,
		redirectOrigin: process.env.TELEGRAM_REDIRECT_ORIGIN
	}
})
