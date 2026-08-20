import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"

import { databaseEnv, grpcEnv, passportEnv, redisEnv } from "./config"
import { PrismaModule } from "./infrastructure/prisma/prisma.module"
import { RedisModule } from "./infrastructure/redis/redis.module"
import { AuthModule } from "./modules/auth/auth.module"
import { OtpModule } from "./modules/otp/otp.module"
import { AccountModule } from './modules/account/account.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [databaseEnv, grpcEnv, passportEnv, redisEnv]
		}),
		PrismaModule,
		RedisModule,
		AuthModule,
		OtpModule,
		AccountModule
	]
})
export class AppModule {}
