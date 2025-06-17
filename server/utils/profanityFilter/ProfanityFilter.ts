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

    const consolidatedWords = consolidateDividedWords(text);
    const separatedText = separateWordsWithWhitespace(consolidatedWords);
    return karabastProfanityMatcher.hasMatch(separatedText);
}

/**
 * For cases like usernames that can't have whitespace, separates a string into words based on common separators
 * such as underscores, periods, and camelCase.
 *
 * Example: "helloWorld" -> "hello World", "hello_world" -> "hello world", "hello.world" -> "hello world"
 */
function separateWordsWithWhitespace(text: string): string {
    const splitOnNonAlphabetic = text.replace(/[._]+/g, ' ');
    const splitOnWordBoundaries = splitOnNonAlphabetic.replace(/([a-z])([A-Z])/g, '$1 $2');

    return splitOnWordBoundaries;
}

function consolidateDividedWords(text: string): string {
    let newString = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (isDividerAt(text, i) && isDividerAt(text, i + 2) && isDividerAt(text, i - 2)) {
            continue;
        }

        newString += char;
    }

    return newString;
}

function isDividerAt(text: string, index: number): boolean {
    if (index < 0 || index >= text.length) {
        return true;
    }

    const char = text[index];
    return char === '_' || char === '.';
}