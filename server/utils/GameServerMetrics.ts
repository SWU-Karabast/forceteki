/**
 * Pre-canned EMF builder for GameServer metrics
 * http://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format_Specification.html
 *
 * Simplified interface for logging GameServer performance metrics to CloudWatch.
 * - Fixed namespace: "GameServer"
 * - No dimensions (empty dimension set)
 * - Predefined metric names and units
 * - Simple JSON input: { metricName: value }
 */

// Essential GameServer metrics - focused on memory and heap compaction
// Reminder: the first 10 custom metrics are free on AWS
export const GAMESERVER_METRICS = {
    EventLoopUtilization: 'Percent',     // Event loop utilization percentage
    EventLoopDelayP50: 'Milliseconds',   // 50th percentile delay
    EventLoopDelayP90: 'Milliseconds',   // 90th percentile delay
    EventLoopDelayP99: 'Milliseconds',   // 99th percentile delay
    EventLoopDelayMax: 'Milliseconds',   // Maximum delay
    TotalUserCount: 'Count',             // Total number of users
    SpectatorCount: 'Count'              // Spectator count
} as const;

export type GameServerMetricName = keyof typeof GAMESERVER_METRICS;
export type GameServerMetricValues = Partial<Record<GameServerMetricName, number | number[]>>;

// EMF document structure (standalone, no external dependencies)
interface EmfMetricDefinition {
    Name: string;
    Unit: string;
}

interface EmfMetricDirective {
    Namespace: string;
    Dimensions: string[][];
    Metrics: EmfMetricDefinition[];
}

interface EmfMetadata {
    Timestamp: number;
    CloudWatchMetrics: EmfMetricDirective[];
}

interface EmfDocument {
    _aws: EmfMetadata;
    [key: string]: unknown;
}

export namespace GameServerMetrics {

    /**
     * Create an EMF document for GameServer metrics
     * @param metrics - Object with metric names as keys and values as numbers or arrays
     * @param timestamp - Optional timestamp in milliseconds since Unix epoch (defaults to Date.now())
     * @returns EMF document ready for jsonOnlyLogger
     */
    export function create(metrics: GameServerMetricValues, timestamp?: number): EmfDocument {
        const metricNames = Object.keys(metrics) as GameServerMetricName[];

        // Validate all metrics are known
        for (const metricName of metricNames) {
            if (!(metricName in GAMESERVER_METRICS)) {
                throw new Error(`Unknown metric: ${metricName}. Available metrics: ${Object.keys(GAMESERVER_METRICS).join(', ')}`);
            }
        }

        // Build the EMF document
        const document: EmfDocument = {
            _aws: {
                Timestamp: timestamp || Date.now(),
                CloudWatchMetrics: [{
                    Namespace: 'GameServer',
                    Dimensions: [[]], // Empty dimension set - no dimensions
                    Metrics: metricNames.map((name) => ({
                        Name: name,
                        Unit: GAMESERVER_METRICS[name]
                    }))
                }],
            },
            ...metrics // Spread the metric values into the root
        };

        return document;
    }

    /**
     * Helper function for creating an EMF document for event loop performance metrics
     * @param utilization - Event loop utilization percentage (0-100)
     * @param delayP50 - 50th percentile event loop delay in milliseconds
     * @param delayP90 - 90th percentile event loop delay in milliseconds
     * @param delayP99 - 99th percentile event loop delay in milliseconds
     * @param delayMax - Maximum event loop delay in milliseconds
     * @returns EMF document ready for jsonOnlyLogger
     */
    export function eventLoopPerformance(utilization: number, delayP50: number, delayP90: number, delayP99: number, delayMax: number): EmfDocument {
        return create({
            // We just want 1 decimal place - so do the rounding here
            EventLoopUtilization: Math.round(utilization * 10) / 10,
            EventLoopDelayP50: Math.round(delayP50 * 10) / 10,
            EventLoopDelayP90: Math.round(delayP90 * 10) / 10,
            EventLoopDelayP99: Math.round(delayP99 * 10) / 10,
            EventLoopDelayMax: Math.round(delayMax * 10) / 10
        });
    }

    export function playerCount(totalUserCount: number, spectatorCount: number): EmfDocument {
        return create({
            TotalUserCount: totalUserCount,
            SpectatorCount: spectatorCount
        });
    }
}
