import * as winston from 'winston';


const isRunningInAWS = !!process.env.AWS_EXECUTION_ENV;

const logFormatter = winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...rest } = info;
    const baseLog = `${timestamp} [${level}]: ${message}`;

    let errorOutput = '';
    let meta = '';

    if (rest && Object.keys(rest).length > 0) {
        // Pull out the error if it's present
        const { error, ...otherFields } = rest;
        if (error && typeof error === 'object') {
            if (error.stack) {
                errorOutput = `\n${error.stack}`;
            } else {
                errorOutput = `\n${error.name || 'Error'}: ${error.message}`;
            }
        }

        if (Object.keys(otherFields).length > 0) {
            meta = ` | ${JSON.stringify(otherFields)}`;
        }
    }

    // Stack from the root error (if not nested under "error")
    if (stack && !meta.includes(stack)) {
        errorOutput += `\n${stack}`;
    }

    return `${baseLog}${meta}${errorOutput}`;
});

export const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        isRunningInAWS ? winston.format.json() : logFormatter
    ),
});
