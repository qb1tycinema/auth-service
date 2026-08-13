import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"

import { PrismaModule } from "./infrastructure/prisma/prisma.module"
import { RedisModule } from "./infrastructure/redis/redis.module"
import { AuthModule } from "./modules/auth/auth.module"
import { OtpModule } from "./modules/otp/otp.module"

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		RedisModule,
		AuthModule,
		OtpModule
	]
})
export class AppModule {}
