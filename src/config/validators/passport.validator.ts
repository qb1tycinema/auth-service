import { IsNumber, IsString } from "class-validator"

export class PassportValidator {
	@IsString()
	public TOKEN_SECRET_KEY!: string

	@IsNumber()
	public TOKEN_ACCESS_TTL!: number

	@IsNumber()
	public TOKEN_REFRESH_TTL!: number
}
