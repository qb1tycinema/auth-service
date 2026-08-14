import { registerAs } from "@nestjs/config"

import { RedisValidator } from "../validators"

import { validateEnv } from "@/shared/utils"

export const redisEnv = registerAs("redis", () => {
	validateEnv(process.env, RedisValidator)

	return {
		user: process.env.REDIS_USER,
		password: process.env.REDIS_PASSWORD,
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT
	}
})
