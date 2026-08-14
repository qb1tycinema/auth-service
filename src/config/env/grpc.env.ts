import { registerAs } from "@nestjs/config"

import type { GrpcConfig } from "../interfaces/grpc.interface"
import { GrpcValidator } from "../validators"

import { validateEnv } from "@/shared/utils"

export const grpcEnv = registerAs<GrpcConfig>("grpc", () => {
	validateEnv(process.env, GrpcValidator)

	return {
		host: process.env.GRPC_HOST,
		port: parseInt(process.env.GRPC_PORT)
	}
})
