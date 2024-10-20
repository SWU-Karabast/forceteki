import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const rotate = new DailyRotateFile({
    filename: __dirname + '/logs/forceteki',
    json: false,
    zippedArchive: true
});

export const logger = winston.createLogger({
    transports: [new winston.transports.Console(), rotate],
    format: winston.format.simple()
});
