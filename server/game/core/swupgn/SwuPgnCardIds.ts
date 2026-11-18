import type { CardId } from '@swupgn/format';
import setCodes from '@swupgn/format/registry/setCodes.json';
import type { Card } from '../card/Card';
import { Contract } from '../utils/Contract';

const knownSetCodes: ReadonlySet<string> = new Set((setCodes as { code: string }[]).map((entry) => entry.code));

/** Token name per SWU-PGN W-20: NFKD, strip combining marks, lowercase, keep a-z 0-9 and spaces, trim, join runs of spaces with `-`. */
export function tokenSlug(title: string): string {
    return title
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .trim()
        .replace(/ +/g, '-');
}

/**
 * The SWU-PGN id of a card (W-17..W-20): `SET#NNN` for a printed card, `TOKEN:<slug>#<numeric id>` for a token.
 * The engine's card data already carries the standard printing of each card (variants are filtered out when it is fetched), so W-18 holds by construction.
 */
export function cardIdOf(card: Card): CardId {
    if (card.isToken()) {
        const slug = tokenSlug(card.title);
        return (/^\d+$/).test(card.id) ? `TOKEN:${slug}#${card.id}` : `TOKEN:${slug}`;
    }

    const { set, number } = card.setId;
    const code = set.toUpperCase();
    Contract.assertTrue(knownSetCodes.has(code), `SWU-PGN: unknown set code '${set}' on card '${card.internalName}'`);
    Contract.assertTrue(Number.isInteger(number) && number > 0, `SWU-PGN: card '${card.internalName}' has no collector number`);
    return `${code}#${String(number).padStart(3, '0')}`;
}
