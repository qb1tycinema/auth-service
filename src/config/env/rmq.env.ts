import { registerAs } from "@nestjs/config"

import { RmqValidator } from "../validators"

import { validateEnv } from "@qb1tycinema/common"

export const rmqEnv = registerAs("rmq", () => {
	validateEnv(process.env, RmqValidator)

	return {
		rmqUrl: process.env.RMQ_URL,
		rmqNotificationsQueue: process.env.RMQ_NOTIFICATIONS_QUEUE
	}
})
