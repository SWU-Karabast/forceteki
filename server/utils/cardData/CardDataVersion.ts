import { logger } from '../../logger';

export function parseCardDataVersion(version: string): string {
    const trimmedVersion = version.trim();
    const versionMatch = trimmedVersion.match(/^(\d{4})(\d{2})(\d{2})_/);

    if (!versionMatch) {
        throw new Error(`Unexpected card data version format: '${trimmedVersion}'`);
    }

    const [, year, month, day] = versionMatch;
    return `${year}-${month}-${day}`;
}

export async function getCardDataVersionInfo(): Promise<string | null> {
    const versionUrl = process.env.CARD_DATA_VERSION_URL;

    if (!versionUrl) {
        return null;
    }

    try {
        const response = await fetch(versionUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch ${versionUrl}: ${response.status} ${response.statusText}`);
        }

        return parseCardDataVersion(await response.text());
    } catch (error) {
        logger.warn('CardDataVersion: Failed to fetch card data version.', error);
        return null;
    }
}
