import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { PROTO_PATHS } from "@qb1tycinema/contracts"

import { UsersClientGrpc } from "./users.grpc"
import type { AllConfigs } from "@/config"

@Module({
	imports: [
		ClientsModule.registerAsync([
			{
				name: "USERS_PACKAGE",
				useFactory: (config: ConfigService<AllConfigs>) => ({
					transport: Transport.GRPC,
					options: {
						package: "users.v1",
						protoPath: PROTO_PATHS.USERS,
						url: config.get("grpc.clients.users", { infer: true })
					}
				}),
				inject: [ConfigService]
			}
		])
	],
	providers: [UsersClientGrpc]
})
export class UsersModule {}
