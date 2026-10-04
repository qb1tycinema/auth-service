import type { DatabaseConfig } from "./database.interface"
import type { GrpcConfig } from "./grpc.interface"
import type { JaegerConfig } from "./jaeger.interface"
import type { LoggerConfig } from "./logger.interface"
import type { PassportConfig } from "./passport.interface"
import type { RedisConfig } from "./redis.interface"
import type { RmqConfig } from "./rmq.interface"
import type { TelegramConfig } from "./telegram.interface"

export interface AllConfigs {
	database: DatabaseConfig
	grpc: GrpcConfig
	jaeger: JaegerConfig
	logger: LoggerConfig
	passport: PassportConfig
	redis: RedisConfig
	rmq: RmqConfig
	telegram: TelegramConfig
}
