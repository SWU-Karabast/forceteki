import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const rotate = new DailyRotateFile({
    filename: __dirname + '/logs/forceteki',
    json: false,
    zippedArchive: true
});

const logFormatter = winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (meta.stack) {
        log += `\n${meta.stack}`;
    }
    return log;
});

export const logger = winston.createLogger({
    transports: [new winston.transports.Console(), rotate],
    format: winston.format.combine(
        winston.format.timestamp(),
        logFormatter
    )
});
