import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"

import { PrismaModule } from "./infrastructure/prisma/prisma.module"
import { AuthModule } from "./modules/auth/auth.module"

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		AuthModule
	]
})
export class AppModule {}
