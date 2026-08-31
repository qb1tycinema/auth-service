import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"

import {
	databaseEnv,
	grpcEnv,
	passportEnv,
	redisEnv,
	rmqEnv,
	telegramEnv
} from "./config"
import { MessagingModule } from "./infrastructure/messaging/messaging.module"
import { PrismaModule } from "./infrastructure/prisma/prisma.module"
import { RedisModule } from "./infrastructure/redis/redis.module"
import { AccountModule } from "./modules/account/account.module"
import { AuthModule } from "./modules/auth/auth.module"
import { OtpModule } from "./modules/otp/otp.module"
import { TelegramModule } from "./modules/telegram/telegram.module"
import { TokenModule } from "./modules/token/token.module"

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [
				databaseEnv,
				grpcEnv,
				passportEnv,
				redisEnv,
				rmqEnv,
				telegramEnv
			]
		}),
		PrismaModule,
		RedisModule,
		MessagingModule,
		AuthModule,
		OtpModule,
		AccountModule,
		TelegramModule,
		TokenModule
	]
})
export class AppModule {}
