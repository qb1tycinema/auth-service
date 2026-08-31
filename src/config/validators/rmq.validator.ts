import { IsString, IsUrl } from "class-validator";

export class RmqValidator {
    @IsUrl({
        protocols: ["amqp"],
        require_tld: false
    })
    public RMQ_URL!: string

    @IsString()
    public RMQ_NOTIFICATIONS_QUEUE!: string
}