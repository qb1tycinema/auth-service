import { Inject, Injectable } from "@nestjs/common"
import { ClientProxy, RmqRecordBuilder } from "@nestjs/microservices"
import { context, propagation } from "@opentelemetry/api"
import type {
	EmailChangeEvent,
	OtpRequestedEvent,
	PhoneChangeEvent
} from "@qb1tycinema/contracts"

@Injectable()
export class MessagingService {
	public constructor(
		@Inject("NOTIFICATIONS_CLIENT") private readonly client: ClientProxy
	) {}

	public async otpRequested(data: OtpRequestedEvent) {
		return this.emitWithTrace("auth.otp.requested", data)
	}

	public async phoneChange(data: PhoneChangeEvent) {
		return this.emitWithTrace("account.phone.change", data)
	}

	public async emailChange(data: EmailChangeEvent) {
		return this.emitWithTrace("account.email.change", data)
	}

	private emitWithTrace<T>(pattern: string, data: T) {
		const headers = {}
		propagation.inject(context.active(), headers)

		const record = new RmqRecordBuilder(data)
			.setOptions({ headers })
			.build()

		return this.client.emit(pattern, record)
	}
}
