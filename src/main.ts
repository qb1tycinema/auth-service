import { ConfigService } from "@nestjs/config"
import { NestFactory } from "@nestjs/core"

import { AppModule } from "./app.module"
import type { AllConfigs } from "./config"
import { createGrpcServer } from "./infrastructure/grpc"

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = app.get(ConfigService<AllConfigs>)

	createGrpcServer(app, config)

	await app.startAllMicroservices()
	await app.init()
}
bootstrap()
