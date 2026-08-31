import { Global, Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"

import { MessagingService } from "./messaging.service"

@Global()
@Module({
	imports: [
		ClientsModule.registerAsync([
			{
				name: "NOTIFICATIONS_CLIENT",
				useFactory: () => ({
					transport: Transport.RMQ,
					options: {
						urls: ["amqp://guest:123456@localhost:5672"],
						queue: "notifications_queue",
						queueOptions: {
							durable: true
						}
					}
				})
			}
		])
	],
	providers: [MessagingService],
	exports: [MessagingService]
})
export class MessagingModule {}
