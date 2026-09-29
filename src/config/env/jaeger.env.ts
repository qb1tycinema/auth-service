import { registerAs } from "@nestjs/config"

import type { JaegerConfig } from "../interfaces/jaeger.interface"
import { JaegerValidator } from "../validators"

import { validateEnv } from "@/shared/utils"

export const jaegerEnv = registerAs<JaegerConfig>("jaeger", () => {
	validateEnv(process.env, JaegerValidator)

	return {
		jaegerUrl: process.env.JAEGER_URL
	}
})
