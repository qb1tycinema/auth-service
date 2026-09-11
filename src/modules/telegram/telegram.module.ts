import { Module } from "@nestjs/common"

import { TokenService } from "../token/token.service"
import { UsersModule } from "../users/users.module"

import { TelegramController } from "./telegram.controller"
import { TelegramRepository } from "./telegram.repository"
import { TelegramService } from "./telegram.service"
import { UserRepository } from "@/shared/repositories"

@Module({
	imports: [UsersModule],
	controllers: [TelegramController],
	providers: [
		TelegramService,
		TelegramRepository,
		TokenService,
		UserRepository
	]
})
export class TelegramModule {}
