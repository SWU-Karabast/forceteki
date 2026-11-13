// One `npm run capture-states` run: whether it checks or updates the committed captures, which
// files its captures produced, and what it found. Capture helpers record each file here as they go;
// `CaptureReport` asks it for the verdict once every capture spec has run.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';

export enum CaptureMode {
    Check = 'check',
    Update = 'update',
}

export class CaptureRun {
    /** Where the committed captures live, relative to the repo root (capture runs from there). */
    private static readonly Root = join(process.cwd(), 'test', 'stateCaptures');

    private static current?: CaptureRun;

    /** Every capture file written or checked in this run, as a `/`-separated path under the root. */
    private readonly recorded = new Set<string>();

    /** Files whose committed contents differ from what the engine produced, in check mode. */
    private readonly mismatches: string[] = [];

    private constructor(public readonly mode: CaptureMode) {}

    /** The run in progress, or an error if this isn't a capture run. */
    public static get(): CaptureRun {
        if (!CaptureRun.current) {
            const mode = process.env.CAPTURE_STATES;
            if (mode !== CaptureMode.Check && mode !== CaptureMode.Update) {
                throw new Error('state capture runs only under `npm run capture-states`');
            }
            CaptureRun.current = new CaptureRun(mode);
        }
        return CaptureRun.current;
    }

    /** Writes or checks one capture file, at `relativePath` (`/`-separated) under the root. */
    public record(relativePath: string, content: string) {
        if (this.recorded.has(relativePath)) {
            throw new Error(`state file ${relativePath} is captured twice; give each capture its own name`);
        }
        this.recorded.add(relativePath);

        const path = join(CaptureRun.Root, relativePath);
        if (this.mode === CaptureMode.Update) {
            mkdirSync(dirname(path), { recursive: true });
            writeFileSync(path, content);
        } else if (!existsSync(path)) {
            this.mismatches.push(`${relativePath}: missing`);
        } else {
            const committed = readFileSync(path, 'utf8');
            if (committed !== content) {
                const differences = CaptureRun.describeDifferences(committed, content);
                this.mismatches.push(`${relativePath}: differs from what the engine sends${differences.map((line) => `\n      ${line}`).join('')}`);
            }
        }
    }

    /** How many changed paths a mismatch lists before summarizing the rest. */
    private static readonly MaxDifferencesShown = 20;

    /**
     * The JSON paths where the committed file and what the engine produced disagree, as
     * `path: committed → produced`, so a failed check says what changed without regenerating locally.
     */
    private static describeDifferences(committedText: string, producedText: string): string[] {
        let committed: unknown;
        try {
            committed = JSON.parse(committedText);
        } catch {
            return ['the committed file is not valid JSON (an unresolved merge conflict?)'];
        }
        const produced: unknown = JSON.parse(producedText);

        const differences: string[] = [];

        // a copy of a card renumbered by another copy appearing before it is one line, not a removal
        // and an addition; the committed side takes the new names so nothing else shows the rename
        const renames = CaptureRun.renumberedCards(committed, produced);
        for (const [before, after] of renames) {
            differences.push(`${before} → ${after} (renumbered)`);
        }
        if (renames.size > 0) {
            committed = JSON.parse(committedText.replace(/"Card-[^"]+-\d+"/g, (quoted) => {
                const id = quoted.slice(1, -1);
                return JSON.stringify(renames.get(id) ?? id);
            }));
        }
        const show = (value: unknown) => {
            if (value === undefined) {
                return '(absent)';
            }
            const text = JSON.stringify(value);
            return text.length > 60 ? `${text.slice(0, 57)}...` : text;
        };
        const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

        // arrays of cards are matched by uuid, so a card added or removed is one line rather than
        // every card after it shifting by one
        const uuidsOf = (items: unknown[]) => items.map((item) => (isObject(item) && typeof item.uuid === 'string' ? item.uuid : undefined));
        const byUuid = (items: unknown[]) => new Map(items.map((item) => [(item as Record<string, unknown>).uuid as string, item]));

        const compare = (before: unknown, after: unknown, path: string) => {
            if (Array.isArray(before) && Array.isArray(after)) {
                const beforeUuids = uuidsOf(before);
                const afterUuids = uuidsOf(after);
                const allUuids = [...beforeUuids, ...afterUuids];
                if (allUuids.length > 0 && allUuids.every((uuid) => uuid !== undefined) && new Set(beforeUuids).size === before.length && new Set(afterUuids).size === after.length) {
                    const beforeItems = byUuid(before);
                    const afterItems = byUuid(after);
                    for (const uuid of new Set(allUuids)) {
                        compare(beforeItems.get(uuid), afterItems.get(uuid), `${path}[${uuid}]`);
                    }
                    const kept = beforeUuids.filter((uuid) => afterItems.has(uuid));
                    if (kept.join() !== afterUuids.filter((uuid) => beforeItems.has(uuid)).join()) {
                        differences.push(`${path}: order changed`);
                    }
                    return;
                }
                for (let i = 0; i < Math.max(before.length, after.length); i++) {
                    compare(before[i], after[i], `${path}[${i}]`);
                }
            } else if (isObject(before) && isObject(after)) {
                for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
                    compare(before[key], after[key], path ? `${path}.${key}` : key);
                }
            } else if (JSON.stringify(before) !== JSON.stringify(after)) {
                differences.push(`${path || '(root)'}: ${show(before)} → ${show(after)}`);
            }
        };
        compare(committed, produced, '');

        if (differences.length === 0) {
            return ['only the formatting differs (line endings or whitespace)'];
        }
        if (differences.length > CaptureRun.MaxDifferencesShown) {
            const hidden = differences.length - CaptureRun.MaxDifferencesShown;
            return [...differences.slice(0, CaptureRun.MaxDifferencesShown), `... and ${hidden} more`];
        }
        return differences;
    }

    /**
     * Copies of a card that kept their place but changed name, as committed name → produced name.
     * Copies are numbered in order of appearance (`StateCapture`'s `nameCards`), so a copy added
     * before them renumbers them. A copy is matched by its card and the list it is first found in.
     */
    private static renumberedCards(committed: unknown, produced: unknown): Map<string, string> {
        const copiesByPlace = (value: unknown) => {
            const places = new Map<string, string[]>();
            const seen = new Set<string>();
            const visit = (child: unknown, path: string) => {
                if (Array.isArray(child)) {
                    child.forEach((item) => visit(item, path));
                } else if (child && typeof child === 'object') {
                    const uuid = (child as Record<string, unknown>).uuid;
                    const card = typeof uuid === 'string' ? (/^Card-(.+)-\d+$/).exec(uuid)?.[1] : undefined;
                    if (card && !seen.has(uuid as string)) {
                        seen.add(uuid as string);
                        const place = `${card} ${path}`;
                        places.set(place, [...(places.get(place) ?? []), uuid as string]);
                    }
                    for (const [key, grandchild] of Object.entries(child)) {
                        visit(grandchild, `${path}.${key}`);
                    }
                }
            };
            visit(value, '');
            return places;
        };

        const before = copiesByPlace(committed);
        const after = copiesByPlace(produced);
        const renames = new Map<string, string>();
        for (const [place, beforeIds] of before) {
            beforeIds.forEach((id, i) => {
                const renamed = after.get(place)?.[i];
                if (renamed && renamed !== id) {
                    renames.set(id, renamed);
                }
            });
        }
        return renames;
    }

    /**
     * In check mode, everything that makes the committed captures out of date. Leave out the stale
     * files when a capture spec failed: it may have stopped before its captures, so its files would
     * be listed as if its spec had been deleted.
     */
    public problems(includeStaleFiles: boolean): string[] {
        if (this.mode !== CaptureMode.Check) {
            return [];
        }
        const stale = includeStaleFiles ? this.staleFiles().map((file) => `${file}: no capture spec produces it anymore`) : [];
        return [...this.mismatches, ...stale];
    }

    /**
     * In update mode, deletes committed files no capture produced. Call it only once every
     * capture spec has run and passed: a spec that didn't run, or failed partway, never reached its
     * captures, so its files would look stale.
     */
    public deleteStaleFiles() {
        if (this.mode !== CaptureMode.Update) {
            return;
        }
        this.staleFiles().forEach((file) => rmSync(join(CaptureRun.Root, file)));
    }

    private staleFiles(): string[] {
        return CaptureRun.committedCaptures(CaptureRun.Root).filter((file) => !this.recorded.has(file));
    }

    private static committedCaptures(dir: string): string[] {
        return readdirSync(dir).flatMap((entry) => {
            const path = join(dir, entry);
            if (statSync(path).isDirectory()) {
                return CaptureRun.committedCaptures(path);
            }
            // recorded paths use `/`; on Windows `relative` gives `\`
            return entry.endsWith('.json') ? [relative(CaptureRun.Root, path).replace(/\\/g, '/')] : [];
        });
    }
}
