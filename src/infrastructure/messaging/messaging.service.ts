import { Inject, Injectable } from "@nestjs/common"
import { ClientProxy } from "@nestjs/microservices"
import type { OtpRequestedEvent } from "@qb1tycinema/contracts"

@Injectable()
export class MessagingService {
	public constructor(
		@Inject("NOTIFICATIONS_CLIENT") private readonly client: ClientProxy
	) {}

	public async otpRequested(data: OtpRequestedEvent) {
		return this.client.emit("auth.otp.requested", data)
	}
}
