import words from 'profane-words';
import { hateGroupsMatcher, karabastProfanityMatcher } from './KarabastProfanityMatcher';


/**
 * Checks if a string contains any profanity from our filter list
 * @param text Text to check for profanity
 * @returns True if profanity is found, false otherwise
 */
export function containsProfanity(text: string): boolean {
    if (!text || typeof text !== 'string') {
        return false;
    }

    const lowercaseText = text.toLowerCase().trim();

    // Check if any word from the profanity list is contained in the text
    return words.some((word) => lowercaseText.includes(word));
}

export function usernameContainsProfanity(text: string): boolean {
    if (hateGroupsMatcher.hasMatch(text)) {
        return true;
    }

    const splitOnNonAlphabetic = text.replace(/[._]+/g, ' ');
    const splitOnWordBoundaries = splitOnNonAlphabetic.replace(/([a-z])([A-Z])/g, '$1 $2');

    return karabastProfanityMatcher.hasMatch(splitOnWordBoundaries);
}
