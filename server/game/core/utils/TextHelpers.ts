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
     * @param aspects The aspect or array of aspects to convert.
     * @param conjunction The conjunction to use between aspects (e.g., "and" or "or").
     * @returns A special replacement string that the client will use to replace with icons.
     */
    aspects: (
        aspects: Aspect | Aspect[],
        conjunction: Conjunction | null = null
    ): string => {
        const aspectArray = Helpers.asArray(aspects);
        if (!conjunction || conjunction === Conjunction.And) {
            return aspectArray.map((aspect) => `:${aspect.toLowerCase()}:`).join('');
        }

        return aspectArray
            .map((aspect, index) => {
                return (aspectArray.length > 1 && index === aspectArray.length - 1)
                    ? `${conjunction} :${aspect.toLowerCase()}:`
                    : `:${aspect.toLowerCase()}:`;
            })
            .join((aspectArray.length > 2) ? ', ' : ' ');
    }
};