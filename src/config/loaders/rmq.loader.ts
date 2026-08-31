import { ConfigService } from "@nestjs/config"
import { RmqOptions, Transport } from "@nestjs/microservices"

import type { AllConfigs } from "../interfaces"

export function getRmqConfig(config: ConfigService<AllConfigs>): RmqOptions {
	return {
		transport: Transport.RMQ,
		options: {
			urls: config.get("rmq.rmqUrl", { infer: true }),
			queue: config.get("rmq.rmqNotificationsQueue", { infer: true }),
			queueOptions: {
				durable: true
			}
		}
	}
}
