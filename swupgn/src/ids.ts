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
