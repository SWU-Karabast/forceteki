import * as winston from 'winston';

const logFormatter = winston.format.printf(({ timestamp, level, message, stack }) => {
    const log = `${timestamp} [${level}]: ${message}`;

    // Cloud watch cannot handle multi-line logs, so we need to replace newlines with a literal '\n'
    if (process.env.AWS_EXECUTION_ENV) {
        return stack ? `${log} ${stack.replace(/\n/g, '\\n')}` : log;
    }

    // Otherwise, keep multi-line formatting for local readability
    return stack ? `${log}\n${stack}` : log;
});

export const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        logFormatter
    )
});
