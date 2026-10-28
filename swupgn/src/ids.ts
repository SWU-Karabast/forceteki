// Name rules for ids (spec 6.1). Imports nothing outside swupgn/.

/** A token's name: lower-case words joined by single hyphens. */
export const TOKEN_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** A token card id: `TOKEN:<name>`, an optional `#<digits>`, an optional `:N` copy (2 and up). */
export const TOKEN_ID = /^TOKEN:[a-z0-9]+(-[a-z0-9]+)*(#\d+)?(:([2-9]|[1-9]\d+))?$/;

/** The token name derived from a token's English printed title (spec 6.1). */
export function tokenName(title: string): string {
    return title
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .trim()
        .replace(/ +/g, '-');
}

/**
 * The name part of a `TOKEN:` id (spec 6.1): the text after `TOKEN:` with a copy suffix in the
 * range the grammar accepts (`:2` and up) and then any `#<cardId>` removed. `TOKEN:credit`,
 * `TOKEN:credit:2` and `TOKEN:credit#8015500527:2` all name `credit`; `TOKEN:credit:1` does not,
 * because `:1` is not a copy suffix. Undefined for an id that is not a token's. It does not
 * check the rest of the grammar: `TOKEN_ID` does that.
 */
export function tokenNameOf(id: string): string | undefined {
    if (typeof id !== 'string' || !id.startsWith('TOKEN:')) {
        return undefined;
    }
    const body = id.slice('TOKEN:'.length).replace(/:([2-9]|[1-9]\d+)$/, '');
    const hash = body.indexOf('#');
    return hash < 0 ? body : body.slice(0, hash);
}
