import * as winston from 'winston';

const logFormatter = winston.format.printf(({ timestamp, level, message, stack }) => {
    const log = `${timestamp} [${level}]: ${message}`;
    return stack ? log + '\n' + stack : log;
});

export const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        logFormatter
    )
});
