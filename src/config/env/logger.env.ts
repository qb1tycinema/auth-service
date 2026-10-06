import { registerAs } from "@nestjs/config"

import type { LoggerConfig } from "../interfaces/logger.interface"
import { LoggerValidator } from "../validators"

import { validateEnv } from "@qb1tycinema/common"

export const loggerEnv = registerAs<LoggerConfig>("logger", () => {
	validateEnv(process.env, LoggerValidator)

	return {
		level: process.env.LOGGER_LEVEL
	}
})
