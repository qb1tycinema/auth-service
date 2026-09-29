import { Module } from "@nestjs/common"

import { MetricsModule } from "./metrics/metrics.module"
import { TracingModule } from "./tracing/tracing.module"

@Module({
	imports: [MetricsModule, TracingModule]
})
export class ObservabilityModule {}
