import fs from 'fs';
import path from 'path';
import { logger } from '../../logger';

const defaultCardDataVersionUrl = 'https://karabast-data.s3.amazonaws.com/card-data-version.txt';

export interface ICardDataVersionInfo {
    lastUpdated: string;
    version: string;
}

export function parseCardDataVersion(version: string): ICardDataVersionInfo {
    const trimmedVersion = version.trim();
    const versionMatch = trimmedVersion.match(/^(\d{4})(\d{2})(\d{2})_/);

    if (!versionMatch) {
        throw new Error(`Unexpected card data version format: '${trimmedVersion}'`);
    }

    const [, year, month, day] = versionMatch;
    return {
        lastUpdated: `${year}-${month}-${day}`,
        version: trimmedVersion
    };
}

export async function getCardDataVersionInfo(): Promise<ICardDataVersionInfo | null> {
    const versionUrl = process.env.CARD_DATA_VERSION_URL ?? defaultCardDataVersionUrl;

    try {
        const response = await fetch(versionUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch ${versionUrl}: ${response.status} ${response.statusText}`);
        }

        return parseCardDataVersion(await response.text());
    } catch (error) {
        logger.warn('CardDataVersion: Failed to fetch card data version from S3, falling back to local file.', error);
    }

    return getLocalCardDataVersionInfo();
}

function getLocalCardDataVersionInfo(): ICardDataVersionInfo | null {
    const localVersionPaths = [
        path.resolve(process.cwd(), 'card-data-version.txt'),
        path.resolve(__dirname, '../../../card-data-version.txt')
    ];

    for (const localVersionPath of localVersionPaths) {
        if (fs.existsSync(localVersionPath)) {
            return parseCardDataVersion(fs.readFileSync(localVersionPath, 'utf8'));
        }
    }

    logger.warn('CardDataVersion: No local card-data-version.txt fallback found.');
    return null;
}
