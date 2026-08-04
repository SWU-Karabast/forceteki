/** Resolves a SET#NUM[:copy] id to a display name. The reference impl is identity;
 *  a host app injects a real card-DB resolver. Copy suffixes are stripped before lookup. */
export interface NameResolver { nameOf(id: string): string; }

export function baseId(ref: string): string {
    return ref.replace(/:\d+$/, '');
}
