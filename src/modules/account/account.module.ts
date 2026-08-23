import { Module } from "@nestjs/common"

import { OtpService } from "../otp/otp.service"

import { AccountController } from "./account.controller"
import { AccountRepository } from "./account.repository"
import { AccountService } from "./account.service"
import { UserRepository } from "@/shared/repositories"

@Module({
	controllers: [AccountController],
	providers: [AccountService, AccountRepository, UserRepository, OtpService]
})
export class AccountModule {}
