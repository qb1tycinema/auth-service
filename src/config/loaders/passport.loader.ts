import type { ConfigService } from "@nestjs/config"
import type { PassportOptions } from "@qb1tycinema/passport"

import type { AllConfigs } from "../interfaces"

export function getPassportConfig(
	config: ConfigService<AllConfigs>
): PassportOptions {
	return {
		secretKey: config.get("passport.secretKey", { infer: true })
	}
}
