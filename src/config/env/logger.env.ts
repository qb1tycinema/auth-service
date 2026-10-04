import { registerAs } from "@nestjs/config"

import type { LoggerConfig } from "../interfaces/logger.interface"
import { LoggerValidator } from "../validators"

import { validateEnv } from "@/shared/utils"

export const loggerEnv = registerAs<LoggerConfig>("logger", () => {
	validateEnv(process.env, LoggerValidator)

	return {
		level: process.env.LOGGER_LEVEL
	}
})
