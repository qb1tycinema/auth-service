import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportModule } from "@qb1tycinema/passport"

import { OtpService } from "../otp/otp.service"

import { AuthController } from "./auth.controller"
import { AuthRepository } from "./auth.repository"
import { AuthService } from "./auth.service"
import { getPassportConfig } from "@/config/loaders"

@Module({
	imports: [
		PassportModule.registerAsync({
			useFactory: getPassportConfig,
			inject: [ConfigService]
		})
	],
	controllers: [AuthController],
	providers: [AuthService, AuthRepository, OtpService]
})
export class AuthModule {}
