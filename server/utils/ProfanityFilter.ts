import words from 'profane-words';
import { profanityList } from './profanity';

// Combine our profanity list with the npm package's list for more comprehensive filtering
const combinedProfanityList = [...new Set([...words, ...profanityList])];

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
    return combinedProfanityList.some((word) => lowercaseText.includes(word));
}

/**
 * Filters profanity from a string and replaces each profane word with asterisks
 * @param text Text to filter for profanity
 * @returns Text with profanity replaced by asterisks
 */
export function filterProfanity(text: string): string {
    if (!text || typeof text !== 'string') {
        return text;
    }

    let filteredText = text;
    
    // Create a regex pattern for word boundaries to ensure we only match whole words
    combinedProfanityList.forEach(word => {
        try {
            // Some words in the list might have special regex characters like '*'
            // Escape the word for regex use and handle special cases
            const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                .replace(/^\*+|\*+$/g, ''); // Remove leading/trailing asterisks
                
            if (escapedWord.length === 0) return; // Skip empty strings
            
            // Create a regex with word boundaries to match the whole word
            const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
            
            // Replace the word with asterisks of the same length
            filteredText = filteredText.replace(regex, match => '*'.repeat(match.length));
        } catch (error) {
            console.error(`Error creating regex for profanity word: ${word}`, error);
            // Continue with the next word if there's an error
        }
    });

    return filteredText;
}