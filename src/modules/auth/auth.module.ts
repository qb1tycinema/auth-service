import { Module } from "@nestjs/common"

import { OtpService } from "../otp/otp.service"

import { AuthController } from "./auth.controller"
import { AuthRepository } from "./auth.repository"
import { AuthService } from "./auth.service"

@Module({
	controllers: [AuthController],
	providers: [AuthService, AuthRepository, OtpService]
})
export class AuthModule {}
