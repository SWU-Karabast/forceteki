/* eslint-disable @stylistic/lines-around-comment */
import { Helpers } from './Helpers';
import { Aspect, KeywordName } from '../Constants';
import type { Conjunction } from '../Constants';
import type { INumericKeywordProperties, KeywordNameOrProperties } from '../../Interfaces';

/**
 * Helper functions for generating formatted text or inserting special tokens to be replaced on the client side with icons or special formatting.
 * These functions should be used in card text and other places where the text will be displayed to the user.
 */
export namespace TextHelper {

    // ─────────────────────────────────────────────────────────────────────────────
    // Aspects
    // ─────────────────────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────────────────────
    // Keywords
    // ─────────────────────────────────────────────────────────────────────────────

    /** The display representation of the meta-term Keyword, stylized on the client side */
    export const Keyword = process.env.NODE_ENV === 'test' ? 'Keyword' : '{keyword:keyword}';
    /** The display representation of the meta-term Keywords, stylized on the client side */
    export const Keywords = process.env.NODE_ENV === 'test' ? 'Keywords' : '{keyword:keywords}';
    /** The display representation of the Ambush keyword, stylized on the client side */
    export const Ambush = keyword(KeywordName.Ambush);
    /** The display representation of the Grit keyword, stylized on the client side */
    export const Grit = keyword(KeywordName.Grit);
    /** The display representation of the Overwhelm keyword, stylized on the client side */
    export const Overwhelm = keyword(KeywordName.Overwhelm);
    /** The display representation of the Saboteur keyword, stylized on the client side */
    export const Saboteur = keyword(KeywordName.Saboteur);
    /** The display representation of the Sentinel keyword, stylized on the client side */
    export const Sentinel = keyword(KeywordName.Sentinel);
    /** The display representation of the Shielded keyword, stylized on the client side */
    export const Shielded = keyword(KeywordName.Shielded);
    /** The display representation of the Bounty keyword, stylized on the client side */
    export const Bounty = keyword(KeywordName.Bounty);
    /** The display representation of the Smuggle keyword, stylized on the client side */
    export const Smuggle = keyword(KeywordName.Smuggle);
    /** The display representation of the Coordinate keyword, stylized on the client side */
    export const Coordinate = keyword(KeywordName.Coordinate);
    /** The display representation of the Piloting keyword, stylized on the client side */
    export const Piloting = keyword(KeywordName.Piloting);
    /** The display representation of the Hidden keyword, stylized on the client side */
    export const Hidden = keyword(KeywordName.Hidden);
    /** The display representation of the Plot keyword, stylized on the client side */
    export const Plot = keyword(KeywordName.Plot);
    /** The display representation of the Raid keyword, stylized on the client side */
    export function Raid(amount: number) {
        return keyword({ keyword: KeywordName.Raid, amount });
    }
    /** The display representation of the Restore keyword, stylized on the client side */
    export function Restore(amount: number) {
        return keyword({ keyword: KeywordName.Restore, amount });
    }
    /** The display representation of the Exploit keyword, stylized on the client side */
    export function Exploit(amount: number) {
        return keyword({ keyword: KeywordName.Exploit, amount });
    }

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
     * Returns the display representation of a keyword. In test environments, this will return a human-readable string (e.g. "Restore 2") for readability,
     * but in production, it returns a token like `{keyword:restore:2}` which the client can replace with stylized text.
     *
     * Accepts any {@link KeywordNameOrProperties} value — a bare keyword name string or any keyword properties object.
     * For numeric keywords (those with an `amount`), the amount is included in the output.
     *
     * @example
     * // In tests: "Restore 2"
     * // Otherwise: "{keyword:restore:2}"
     * const ex = `${TextHelper.keyword({ keyword: KeywordName.Restore, amount: 2 })}`;
     *
     * @param keyword The keyword to display — a keyword name, or a keyword properties object (numeric or otherwise)
     * @returns A string representing the keyword, either as plain text (in tests) or a replacement token
     */
    export function keyword(keyword: KeywordNameOrProperties | KeywordName | INumericKeywordProperties): string {
        if (typeof keyword === 'object') {
            if ('amount' in keyword) {
                return process.env.NODE_ENV === 'test'
                    ? `${Helpers.capitalize(keyword.keyword)} ${keyword.amount}`
                    : `{keyword:${keyword.keyword}:${keyword.amount}}`;
            }

            return process.env.NODE_ENV === 'test'
                ? Helpers.capitalize(keyword.keyword)
                : `{keyword:${keyword.keyword}}`;
        }

        return process.env.NODE_ENV === 'test'
            ? Helpers.capitalize(keyword)
            : `{keyword:${keyword}}`;
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