import type { Board, Entity, SwuRecord } from '@swupgn/format';
import { SwuPgnError } from '@swupgn/format';
import { diff } from '@swupgn/format/writer';

/**
 * The records that turn `prev` into `next`, like the package's `diff`, also when a parent changes zone between
 * the two boards while it has a child: a unit that changes arena with its upgrades, or a unit that enters play and
 * gets a token in the same event window. No single diff keeps [W-28] then, since the child must be in its parent's
 * zone after every record.
 *
 * Such boards are written in two passes through a middle board: first each kept child is detached (it keeps its old
 * zone) and each new child is left out, while the parents move; then the children are attached again, or created,
 * in their parents' new zone.
 */
export function diffBoards(prev: Board, next: Board): SwuRecord[] {
    try {
        return diff(prev, next);
    } catch (error) {
        if (!(error instanceof SwuPgnError) || error.code !== 'unreachable-board') {
            throw error;
        }
        const middle = middleBoard(prev, next);
        if (middle === null) {
            throw error;
        }
        return [...diff(prev, middle), ...diff(middle, next)];
    }
}

/** `next` with the children of every parent that changes zone detached (when kept) or left out (when new); null when there is none. */
function middleBoard(prev: Board, next: Board): Board | null {
    const entities: Record<string, Entity> = { ...next.entities };
    let changed = false;
    for (const [id, entity] of Object.entries(next.entities)) {
        if (entity.parent === undefined || entity.rel === 'captured') {
            continue;
        }
        const parent = String(entity.parent);
        const before = prev.entities[parent];
        const after = next.entities[parent];
        if (before === undefined || after === undefined || before.zone === after.zone) {
            continue;
        }

        const old = prev.entities[id];
        if (old === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete entities[id];
        } else if (old.parent === entity.parent) {
            const detached: Entity = { ...old };
            delete detached.parent;
            delete detached.rel;
            entities[id] = detached;
        } else {
            continue; // a new parent: the diff already attaches it after the parent moves
        }
        changed = true;
    }
    return changed ? { seq: next.seq, entities } : null;
}
