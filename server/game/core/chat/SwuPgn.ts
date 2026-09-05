export class SwuPgn {
    /**
     * Formats a SET#NUM identifier: uppercases the set and zero-pads the number to 3 digits.
     */
    public static formatSetId(set: string, number: number): string {
        return `${set.toUpperCase()}#${String(number).padStart(3, '0')}`;
    }

    /**
     * Formats a token identifier: `TOKEN:<internalName>#<numericId>`, e.g.
     * `TOKEN:advantage#5844562972`.
     *
     * Tokens carry a `setId` with a set but NO number, so `formatSetId` can't name them —
     * which is why they used to be written as the unresolvable `TOKEN:Advantage`. Their card
     * JSON does carry the same numeric `id` the card map and the token image pipeline key on,
     * so that is what goes in the identifier: a reader can resolve art and metadata from it.
     * The `TOKEN:` prefix is kept so a token stays distinguishable from a `SET#NUM` card at a
     * glance, and the internal name keeps the id readable.
     *
     * Falls back to `TOKEN:<internalName>` when no numeric id is available, so a token with
     * incomplete data still gets a stable (if unresolvable) name rather than breaking the file.
     */
    public static formatTokenId(internalName: string, numericId?: string | null): string {
        const name = internalName || 'unknown';
        // Only a genuinely numeric id is resolvable. Some tokens carry a placeholder in their
        // card data (Weakness is `weakness-id`, Beast is `beast-id`); emitting those would
        // produce `TOKEN:weakness#weakness-id`, which LOOKS like a resolvable identifier and
        // is not. Better to emit the honest degraded form the spec defines for that case.
        return numericId && (/^\d+$/).test(numericId) ? `TOKEN:${name}#${numericId}` : `TOKEN:${name}`;
    }
}
