import * as Helpers from './Helpers';
import { Aspect } from '../Constants';
import type { Conjunction } from '../Constants';

/**
 * Helper functions for generating formatted text or inserting special tokens to be replaced on the client side with icons or special formatting.
 * These functions should be used in card text and other places where the text will be displayed to the user.
 */
export const TextHelper = {

    /**
     * Performs all necessary replacements on the given text to convert specific strings into the format
     * expected by the client for icon replacement and special formatting. Currently supported replacements
     * include only the aspect names, case insensitive.
     *
     * Example: "Deal 2 damage to a Villainy unit and 1 damage to a Heroism unit" would be transformed into
     * "Deal 2 damage to a :villainy: unit and 1 damage to a :heroism: unit" for the client to replace with icons.
     *
     * In a test environment, this function will skip replacements to make it easier to test and read the text.
     *
     * @param text The text to perform replacements on.
     * @returns The text with all replacements applied.
     */
    performReplacements: (text: string): string => {
        // Do not perform replacement in test environment to make it easier to test and read the text
        if (process.env.NODE_ENV === 'test') {
            return text;
        }

        const rules: TextReplacementRule[] = [
            ...aspectReplacementRule
            // Add more replacement rules here as needed
        ];

        // Build one regex with a dedicated capturing group per rule so we can
        // identify *which* rule produced each match without running them serially.
        const combined = new RegExp(
            rules.map((r) => `(${r.pattern.source})`).join('|'),
            'gi'
        );

        return text.replace(combined, (match, ...groups) => {
            const ruleIndex = groups.findIndex((group) => group !== undefined);
            if (ruleIndex === -1) {
                return match;
            }
            const rule = rules[ruleIndex];
            return rule.replace(match, ruleIndex);
        });
    },

    /**
     * Creates a string representation of one or more aspects, taking the conjunction into account for proper formatting. For example:
     *
     * - `TextHelper.aspectList(Aspect.Heroism)` => "Heroism"
     * - `TextHelper.aspectList([Aspect.Heroism, Aspect.Villainy])` => "Heroism, Villainy"
     * - `TextHelper.aspectList([Aspect.Command, Aspect.Cunning, Aspect.Villainy], Conjunction.Or)` => "Command, Cunning, or Villainy"
     */
    aspectList: (
        aspects: Aspect | Aspect[],
        conjunction: Conjunction | null = null
    ): string => {
        const aspectArray = Helpers.asArray(aspects);
        const transformation = (aspect: Aspect) => Helpers.capitalize(aspect);

        if (!conjunction) {
            const separator = process.env.NODE_ENV === 'test' ? ', ' : '';
            return aspectArray
                .map(transformation)
                .join(separator);
        }

        return aspectArray
            .map((aspect, index) => {
                return (aspectArray.length > 1 && index === aspectArray.length - 1)
                    ? `${conjunction} ${transformation(aspect)}`
                    : transformation(aspect);
            })
            .join((aspectArray.length > 2) ? ', ' : ' ');
    }
};

interface TextReplacementRule {
    pattern: RegExp;
    replace: (match: string, key: number) => string;
}

const aspectReplacementRule: TextReplacementRule[] = Object.entries(Aspect).map(
    ([, aspectValue]) => ({
        // Case-insensitive regex to match the aspect name
        pattern: new RegExp(`${aspectValue}`, 'i'),
        replace: () => `:${aspectValue.toLowerCase()}:`
    })
);