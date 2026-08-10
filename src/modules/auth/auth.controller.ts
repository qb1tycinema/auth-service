import { Controller } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import type {
	SendOtpRequest,
	SendOtpResponse
} from "@qb1tycinema/contracts/gen/auth"

import { AuthService } from "./auth.service"

@Controller()
export class AuthController {
	public constructor(private readonly authService: AuthService) {}

	@GrpcMethod("AuthService", "SendOtp")
	public async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		console.log("Incoming OTP request: ", data)

		return { ok: true }
	}
}
