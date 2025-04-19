import { profanityList } from './profanity';

/**
 * Checks if a string contains any profanity from our filter list
 * @param text Text to check for profanity
 * @returns True if profanity is found, false otherwise
 */
export function containsProfanity(text: string): boolean {
    if (!text || typeof text !== 'string') {
        return false;
    }

    const lowercaseText = text.toLowerCase();
    return profanityList.some((word) =>
        lowercaseText.includes(word.toLowerCase().trim())
    );
}