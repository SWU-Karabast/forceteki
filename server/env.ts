import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const parsedEnv = z
    .object({
        ENVIRONMENT: z.string(),
        GAME_NODE_HOST: z.string(),
        GAME_NODE_NAME: z.string(),
        GAME_NODE_SOCKET_IO_PORT: z.coerce.number().int(),
        AWS_REGION: z.string().optional(),
        AWS_ACCESS_KEY_ID: z.string().optional(),
        AWS_SECRET_ACCESS_KEY: z.string().optional(),
        NEXTAUTH_SECRET: z.string().optional(),
        DISCORD_BUG_REPORT_WEBHOOK_URL: z.string().optional(),
        DISCORD_ERROR_REPORT_WEBHOOK_URL: z.string().optional(),
        ADDITIONAL_CORS_ORIGINS: z.string().optional(),
        SWUStatsAPIKey: z.string().optional(),
    })
    .safeParse(process.env);

/*
    .object({
    // CAPTCHA_KEY: z.string().optional(),
    // COOKIE_LIFETIME: z.string().optional(),
    // DB_PATH: z.string(),
    // DOMAIN: z.string(),
    // EMAIL_PATH: z.string().optional(),
    ENVIRONMENT: z.string(),
    // GAME_NODE_CERT_PATH: z.string().optional(),
    GAME_NODE_HOST: z.string(),
    // GAME_NODE_KEY_PATH: z.string().optional(),
    GAME_NODE_NAME: z.string(),
    // GAME_NODE_ORIGIN: z.string().optional(),
    // GAME_NODE_PROXY_PORT: z.coerce.number().int().optional(),
    GAME_NODE_SOCKET_IO_PORT: z.coerce.number().int(),
    // HMAC_SECRET: z.string().optional(),
    // HTTPS: z.string(),
    // LOBBY_PORT: z.coerce.number().int(),
    // MAX_GAMES: z.coerce.number().int().optional(),
    // MQ_URL: z.string(),
    SECRET: z.string()
    // SENTRY_DSN: z.string().optional()

*/

if (!parsedEnv.success) {
    throw Error(`Failed to initialize environment variables: ${(parsedEnv as any).error.message}`);
}

const defaultOrigins = ['http://localhost:3000', 'https://karabast.net', 'https://www.karabast.net'];

export const corsOrigins = parsedEnv.data.ADDITIONAL_CORS_ORIGINS
    ? [
        ...defaultOrigins,
        ...parsedEnv.data.ADDITIONAL_CORS_ORIGINS.split(',').filter((origin) => origin.trim() !== '')
    ]
    : defaultOrigins;

// export const captchaKey = parsedEnv.data.CAPTCHA_KEY;
// export const cookieLifetime = parsedEnv.data.COOKIE_LIFETIME;
// export const dbPath = parsedEnv.data.DB_PATH;
// export const domain = parsedEnv.data.DOMAIN;
// export const emailPath = parsedEnv.data.EMAIL_PATH;
export const environment = parsedEnv.data.ENVIRONMENT;
// export const gameNodeCertPath = parsedEnv.data.GAME_NODE_CERT_PATH;
export const gameNodeHost = parsedEnv.data.GAME_NODE_HOST;
// export const gameNodeKeyPath = parsedEnv.data.GAME_NODE_KEY_PATH;
export const gameNodeName = parsedEnv.data.GAME_NODE_NAME;
// export const gameNodeOrigin = parsedEnv.data.GAME_NODE_ORIGIN;
// export const gameNodeProxyPort = parsedEnv.data.GAME_NODE_PROXY_PORT;
export const gameNodeSocketIoPort = parsedEnv.data.GAME_NODE_SOCKET_IO_PORT;
// export const hmacSecret = parsedEnv.data.HMAC_SECRET;
// export const https = parsedEnv.data.HTTPS;
// export const lobbyPort = parsedEnv.data.LOBBY_PORT;
// export const maxGames = parsedEnv.data.MAX_GAMES;
// export const mqUrl = parsedEnv.data.MQ_URL;
export const DISCORD_BUG_REPORT_WEBHOOK_URL = parsedEnv.data.DISCORD_BUG_REPORT_WEBHOOK_URL;
export const DISCORD_ERROR_REPORT_WEBHOOK_URL = parsedEnv.data.DISCORD_ERROR_REPORT_WEBHOOK_URL;
// export const sentryDsn = parsedEnv.data.SENTRY_DSN;
export const AWS_REGION = parsedEnv.data.AWS_REGION;
export const AWS_ACCESS_KEY_ID = parsedEnv.data.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = parsedEnv.data.AWS_SECRET_ACCESS_KEY;
export const NEXTAUTH_SECRET = parsedEnv.data.NEXTAUTH_SECRET;
export const SWUStatsAPIKey = parsedEnv.data.SWUStatsAPIKey;