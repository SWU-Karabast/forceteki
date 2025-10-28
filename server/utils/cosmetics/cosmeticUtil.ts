import { type IRegisteredCosmeticOption } from './CosmeticsInterfaces';

export const getFallbackCosmetics = async (logger: any): Promise<IRegisteredCosmeticOption[]> => {
    try {
        const fs = await import('fs');
        const path = await import('path');
        const fallbackPath = path.resolve(__dirname, '../data/fallback-cosmetics.json');
        const fallbackData = fs.readFileSync(fallbackPath, 'utf8');
        const fallbackCosmetics = JSON.parse(fallbackData) as IRegisteredCosmeticOption[];
        return fallbackCosmetics;
    } catch (error) {
        logger.error('Failed to load fallback cosmetics from file:', error);
        return [];
    }
};