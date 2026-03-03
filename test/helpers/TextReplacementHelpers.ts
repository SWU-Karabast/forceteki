import { Aspect } from '../../server/game/core/Constants';

// Two-way conversion for aspect icon replacement tokens in prompt titles to aspect names for easier testing
const aspectsTokensRegex = new RegExp(`:(${Object.values(Aspect).join('|')}):`, 'g');
const aspectNamesRegex = new RegExp(`\\b(${Object.keys(Aspect).join('|')})\\b`, 'gi');
export const AspectHelper = {
    removeReplacementTokens: (promptTitle: string): string => {
        return promptTitle
            .replace(aspectsTokensRegex, (_, capture) => {
                const aspectName = Object.entries(Aspect)
                    .find(([, value]) => value === capture)?.[0];
                return aspectName ? aspectName : capture;
            });
    },
    insertReplacementTokens: (promptTitle: string): string => {
        return promptTitle
            .replace(aspectNamesRegex, (match) => {
                const aspectToken = Object.entries(Aspect)
                    .find(([key]) => key.toLowerCase() === match.toLowerCase())?.[1];
                return aspectToken ? `:${aspectToken}:` : match;
            });
    }
};
