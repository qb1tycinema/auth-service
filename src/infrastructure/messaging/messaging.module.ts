import { Global, Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ClientsModule } from "@nestjs/microservices"

import { MessagingService } from "./messaging.service"
import { getRmqConfig } from "@/config/loaders"

@Global()
@Module({
	imports: [
		ClientsModule.registerAsync([
			{
				name: "NOTIFICATIONS_CLIENT",
				useFactory: getRmqConfig,
				inject: [ConfigService]
			}
		])
	],
	providers: [MessagingService],
	exports: [MessagingService]
})
export class MessagingModule {}
