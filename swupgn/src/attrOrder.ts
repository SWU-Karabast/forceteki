import { ATTRIBUTES } from './registry.js';

const ATTRIBUTE_RANK: ReadonlyMap<string, number> = new Map(ATTRIBUTES.map((a, i) => [a.name, i]));

/** Compare by code point, not by UTF-16 unit. */
export function compareCodePoints(a: string, b: string): number {
    const ia = a[Symbol.iterator]();
    const ib = b[Symbol.iterator]();
    for (;;) {
        const x = ia.next();
        const y = ib.next();
        if (x.done || y.done) {
            return (x.done ? 0 : 1) - (y.done ? 0 : 1);
        }
        const cx = x.value.codePointAt(0) as number;
        const cy = y.value.codePointAt(0) as number;
        if (cx !== cy) {
            return cx - cy;
        }
    }
}

/** Attribute names in canonical order ([W-07]): registry order, then unregistered names ascending by code point. */
export function canonicalAttrNames(names: readonly string[]): string[] {
    const registered = names.filter((k) => ATTRIBUTE_RANK.has(k))
        .sort((x, y) => (ATTRIBUTE_RANK.get(x) as number) - (ATTRIBUTE_RANK.get(y) as number));
    const others = names.filter((k) => !ATTRIBUTE_RANK.has(k)).sort(compareCodePoints);
    return [...registered, ...others];
}

/** A copy of `attrs` with its keys in canonical order. */
export function canonicalAttrs<T>(attrs: Record<string, T>): Record<string, T> {
    const out: Record<string, T> = {};
    for (const k of canonicalAttrNames(Object.keys(attrs))) {
        out[k] = attrs[k];
    }
    return out;
}
