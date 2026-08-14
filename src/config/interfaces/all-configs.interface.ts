import type { DatabaseConfig } from "./database.interface"
import type { GrpcConfig } from "./grpc.interface"
import type { RedisConfig } from "./redis.interface"

export interface AllConfigs {
	database: DatabaseConfig
	grpc: GrpcConfig
	redis: RedisConfig
}
