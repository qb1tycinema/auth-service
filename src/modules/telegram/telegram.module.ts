import { Module } from "@nestjs/common"

import { TokenService } from "../token/token.service"

import { TelegramController } from "./telegram.controller"
import { TelegramRepository } from "./telegram.repository"
import { TelegramService } from "./telegram.service"
import { UserRepository } from "@/shared/repositories"

@Module({
	controllers: [TelegramController],
	providers: [
		TelegramService,
		TelegramRepository,
		TokenService,
		UserRepository
	]
})
export class TelegramModule {}
