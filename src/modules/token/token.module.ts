import { Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PassportModule } from "@qb1tycinema/passport"

import { TokenService } from "./token.service"
import { getPassportConfig } from "@/config/loaders"

@Module({
	imports: [
		PassportModule.registerAsync({
			useFactory: getPassportConfig,
			inject: [ConfigService]
		})
	],
	providers: [TokenService],
	exports: [TokenService]
})
export class TokenModule {}
