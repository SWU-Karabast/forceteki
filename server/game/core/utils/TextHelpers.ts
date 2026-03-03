import * as Helpers from './Helpers';
import type { Aspect } from '../Constants';
import { Conjunction } from '../Constants';

/**
 * Helper functions for generating text that will be replaced on the client side with icons or special formatting.
 * These functions should be used in card text and other places where the text will be displayed to the user.
 */
export const TextHelper = {
    /**
     * Converts an aspect or array of aspects into a string that will be replaced
     * with the appropriate icons on the client side.
     *
     * In a test environment, it will return the aspect names capitalized for easier testing and readability.
     *
     * @param aspects The aspect or array of aspects to convert.
     * @param conjunction The conjunction to use between aspects (e.g., "and" or "or").
     * @returns A special replacement string that the client will use to replace with icons.
     */
    aspects: (
        aspects: Aspect | Aspect[],
        conjunction: Conjunction | null = null
    ): string => {
        const aspectArray = Helpers.asArray(aspects);
        const isTestEnv = process.env.NODE_ENV === 'test';
        const transformation = isTestEnv
            ? (aspect: Aspect) => Helpers.capitalize(aspect)
            : (aspect: Aspect) => `:${aspect.toLowerCase()}:`;

        if (!conjunction || conjunction === Conjunction.And) {
            const separator = isTestEnv ? ', ' : '';
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