import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit
} from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { PrismaClient } from "@orm/generated/client"
import { PrismaPg } from "@prisma/adapter-pg"

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(PrismaService.name)

	public constructor(private readonly config: ConfigService) {
		const adapter = new PrismaPg({
			user: config.getOrThrow<string>("POSTGRES_USER"),
			password: config.getOrThrow<string>("POSTGRES_PASSWORD"),
			host: config.getOrThrow<string>("POSTGRES_HOST"),
			port: config.getOrThrow<number>("POSTGRES_PORT"),
			database: config.getOrThrow<string>("POSTGRES_DATABASE")
		})

		super({ adapter })
	}

	public async onModuleInit() {
		const start = Date.now()

		this.logger.log("Connecting to Database...")

		try {
			await this.$connect()

			const ms = Date.now() - start

			this.logger.log(`Database connection established (time=${ms}ms)`)
		} catch (error) {
			this.logger.error("Failed to connect to database: ", error)

			throw error
		}
	}

	public async onModuleDestroy() {
		this.logger.log("Disconnecting from database")

		try {
			await this.$disconnect()

			this.logger.log("Database connection closed")
		} catch (error) {
			this.logger.error("Failed to disconnect from database: ", error)

			throw error
		}
	}
}
