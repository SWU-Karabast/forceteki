/* eslint-disable @stylistic/lines-around-comment */
import { Helpers } from './Helpers';
import { Aspect } from '../Constants';
import type { Conjunction } from '../Constants';

/**
 * Helper functions for generating formatted text or inserting special tokens to be replaced on the client side with icons or special formatting.
 * These functions should be used in card text and other places where the text will be displayed to the user.
 */
export namespace TextHelper {

    // Quick access to specific aspects

    /** The display representation of the Vigilance aspect, replaced by the icon on the client side */
    export const Vigilance = aspect(Aspect.Vigilance);
    /** The display representation of the Command aspect, replaced by the icon on the client side */
    export const Command = aspect(Aspect.Command);
    /** The display representation of the Aggression aspect, replaced by the icon on the client side */
    export const Aggression = aspect(Aspect.Aggression);
    /** The display representation of the Cunning aspect, replaced by the icon on the client side */
    export const Cunning = aspect(Aspect.Cunning);
    /** The display representation of the Villainy aspect, replaced by the icon on the client side */
    export const Villainy = aspect(Aspect.Villainy);
    /** The display representation of the Heroism aspect, replaced by the icon on the client side */
    export const Heroism = aspect(Aspect.Heroism);

    /**
     * Returns the display representation of a resource amount. In test environments, this will return a string
     * like "2 resources" for readability, but in production, it returns a token like `{resource:2}` which the
     * client can replace with an icon.
     *
     * @example
     * // In tests: "You may pay 2 resources"
     * // Otherwise: "You may pay {resource:2}"
     * const ex = `You may pay ${TextHelper.resource(2)}`;
     *
     * @param amount The amount of resources to display
     * @returns A string representing the resource amount, either as plain text (in tests) or a replacement token
     */
    export function resource(amount: number): string {
        return process.env.NODE_ENV === 'test'
            ? `${amount} resource${amount !== 1 ? 's' : ''}`
            : `{resource:${amount}}`;
    }

    /**
     * Returns the display representation of an aspect name for use in string interpolation.
     * In test environments, returns the capitalized name (e.g. "Heroism") for readability.
     * In production, returns a token (e.g. `:heroism:`) for client-side icon rendering.
     *
     * @example
     * // In tests: "Ready a Villainy unit"
     * // Otherwise: "Ready a :villainy: unit"
     * const ex = `Ready a ${TextHelper.Villainy} unit`
     */
    export function aspect(asp: Aspect): string {
        return process.env.NODE_ENV === 'test'
            ? Helpers.capitalize(asp)
            : `:${asp}:`;
    }

    /**
     * Creates a formatted list of aspect names with an optional conjunction for the last item. This also performs
     * the same text replacement as the {@link TextHelper.aspect} function for each aspect name.
     *
     * @example
     *  // "Heroism, Villainy"
     *  const ex1 = `${TextHelper.aspectList([Aspect.Heroism, Aspect.Villainy])}`;
     *  // "Command, Cunning, or Villainy"
     *  const ex2 = `${TextHelper.aspectList([Aspect.Command, Aspect.Cunning, Aspect.Villainy], Conjunction.Or)}`;
     */
    export function aspectList(
        aspects: Aspect[],
        conjunction: Conjunction | null = null
    ): string {
        if (!conjunction) {
            // For tests, we use commas for readability, but when these are sent to the client,
            // they'll be replaced with icons, so we want no separator at all.
            const separator = process.env.NODE_ENV === 'test' ? ', ' : '';
            return aspects
                .map(aspect)
                .join(separator);
        }

        return aspects
            .map((a, index) => {
                return (aspects.length > 1 && index === aspects.length - 1)
                    ? `${conjunction} ${aspect(a)}`
                    : aspect(a);
            })
            .join((aspects.length > 2) ? ', ' : ' ');
    }
}