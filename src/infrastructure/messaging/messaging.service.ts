import { Inject, Injectable } from "@nestjs/common"
import { ClientProxy } from "@nestjs/microservices"
import type { EmailChangeEvent, OtpRequestedEvent, PhoneChangeEvent } from "@qb1tycinema/contracts"

@Injectable()
export class MessagingService {
	public constructor(
		@Inject("NOTIFICATIONS_CLIENT") private readonly client: ClientProxy
	) {}

	public async otpRequested(data: OtpRequestedEvent) {
		return this.client.emit("auth.otp.requested", data)
	}

	public async phoneChange(data: PhoneChangeEvent) {
		return this.client.emit("account.phone.change", data)
	}

	public async emailChange(data: EmailChangeEvent) {
		return this.client.emit("account.email.change", data)
	}
}
