import { SwuPgnError } from '../errors.js';
import { applyRecord, emptyBoard } from '../apply.js';
import { canonicalAttrs } from '../attrOrder.js';
import { lineOf } from '../parse.js';
import { ATTRIBUTES, ZONES, isFaceDownAttribute, isRegisteredAttribute, isRegisteredHeaderTag } from '../registry.js';
import type {
    Attrs, AttrValue, Audience, BlockRecord, Board, CardLine, CreateRecord, DeckLine, Entity, EntityId, RevealRecord, Seat, SetRecord,
    SwuPgnFile, SwuRecord,
} from '../generated/types.js';

/** Whose file to write: a seat's `perspective` file, or the `public` file. */
export type View = Seat | 'public';

type Status = 'known' | 'anonymous' | 'unmaterialized';

const FIXED_IDS: ReadonlySet<string> = new Set(['g', 'p1', 'p2']);
const OPPONENT_SEES: ReadonlyMap<string, string> = new Map(ZONES.map((z) => [z.name, z.opponentSees]));
const REF_ATTRIBUTES: ReadonlySet<string> = new Set(ATTRIBUTES.filter((a) => a.type === 'ref').map((a) => a.name));
const EFFECT_ATTRIBUTES: ReadonlySet<string> = new Set(ATTRIBUTES.filter((a) => a.on.includes('effect')).map((a) => a.name));
const REF_ARRAY_ATTRIBUTES: ReadonlySet<string> = new Set(ATTRIBUTES.filter((a) => a.type === 'ref[]').map((a) => a.name));

/** The words that go with a dropped reference (SPEC §11.1). */
const FREE_TEXT_ATTRIBUTES: readonly string[] = ['text', 'untilText', 'ability'];
const BLOCK_SINGLE_REFS = ['src', 'via'] as const;
const BLOCK_LIST_REFS = ['targets', 'options'] as const;

/** A zone's opponent visibility; a zone the registry does not list is count-only (SPEC §10.3). */
function opponentSees(zone: string | undefined): string {
    return zone === undefined ? 'count' : OPPONENT_SEES.get(zone) ?? 'count';
}

function seatOf(e: { controller?: Seat; owner?: Seat }): Seat | undefined {
    return e.controller ?? e.owner;
}

function isEntityId(v: AttrValue): v is EntityId {
    return (typeof v === 'number' && Number.isInteger(v) && v > 0) || (typeof v === 'string' && FIXED_IDS.has(v));
}

/** One redaction of one full file. It reads `RECORDS` once, in order, never looking ahead (SPEC §11). */
class Redactor {
    private readonly viewer: Seat | null;
    private readonly board: Board = emptyBoard();
    private readonly status = new Map<string, Status>();
    private readonly forgotten = new Set<string>();
    private readonly idMap = new Map<string, number>();
    private readonly keyOf = new Map<number, string>();
    private nextId = 1;
    public readonly out: SwuRecord[] = [];

    /** The card ids the output gives to entities, with their owner, in the order first given ([R-11]). */
    public readonly given: { card: string; owner: Seat | undefined }[] = [];

    public constructor(view: View) {
        this.viewer = view === 'public' ? null : view;
    }

    // ---- knowledge -------------------------------------------------------------------------

    /** A seat V is in an audience when it is "all", or a list holding V; in a public file only "all" (SPEC §10.2). */
    private holds(to: Audience | undefined): boolean {
        return to === 'all' || (this.viewer !== null && Array.isArray(to) && to.includes(this.viewer));
    }

    private entity(key: string): Entity | undefined {
        return Object.prototype.hasOwnProperty.call(this.board.entities, key) ? this.board.entities[key] : undefined;
    }

    /** Whether the entity's audience holds V; a forgotten entity's never does (SPEC §11.1). */
    private audienceHolds(key: string): boolean {
        return !this.forgotten.has(key) && this.holds(this.entity(key)?.to);
    }

    /** Anonymous or unmaterialized, for an entity V does not know, by its zone (SPEC §10.3). */
    private unknownStatus(e: { zone?: string }): Status {
        const sees = opponentSees(e.zone);
        return sees === 'anonymous' || sees === 'public' ? 'anonymous' : 'unmaterialized';
    }

    /** A hand whose seat is not V; in a public file, every hand (SPEC §10.3). */
    private inHiddenHand(e: Entity): boolean {
        return e.zone === 'hand' && (this.viewer === null || seatOf(e) !== this.viewer);
    }

    /** Whether a block or a `ref` attribute may name the entity ([R-09], §11.1 Mapping). */
    private referable(id: EntityId): boolean {
        const key = String(id);
        if (FIXED_IDS.has(key)) {
            return true;
        }
        const e = this.entity(key);
        return e !== undefined && this.status.get(key) === 'known' && !this.inHiddenHand(e);
    }

    // ---- ids -------------------------------------------------------------------------------

    /** The next of 1, 2, 3, … in order of first use ([R-14]). */
    private fresh(key: string): number {
        const id = this.nextId++;
        this.idMap.set(key, id);
        this.keyOf.set(id, key);
        return id;
    }

    private mapped(id: EntityId): EntityId {
        const key = String(id);
        return FIXED_IDS.has(key) ? id : this.idMap.get(key) as number;
    }

    /** [R-16] A parent must map to an output entity; the record is never emitted without it. */
    private mappedParent(parent: EntityId, line: number | undefined): EntityId {
        const key = String(parent);
        if (!FIXED_IDS.has(key) && !this.idMap.has(key)) {
            throw new SwuPgnError('parent-rel', `parent ${JSON.stringify(parent)} is not an entity of this view${line === undefined ? '' : ` (line ${line})`}`, line);
        }
        return this.mapped(parent);
    }

    // ---- attributes ------------------------------------------------------------------------

    /**
     * §11.1 Mapping: a `ref` attribute keeps only a reference V may follow, mapped; a `ref[]`
     * attribute keeps its referable elements, even when none is left. Any dropped reference takes
     * `text`, `untilText` and `ability` with it. In a `create` a dropped attribute is left out; in a
     * `set` it is written `null`, so the viewer's board deletes the stale value. An attribute the
     * registry does not list (every `x_` extension) is left out on every entity, `g`, `p1` and `p2`
     * included ([W-67]). On an effect, only `kind` and the attributes registered for effects are kept (§10.4).
     */
    private mapAttrs(a: Attrs, entity: Entity, inSet: boolean): Attrs {
        const effect = entity.a.kind === 'effect';
        const out: Attrs = {};
        const gone: string[] = [];
        let dropped = false;
        for (const [k, v] of Object.entries(a)) {
            if (!isRegisteredAttribute(k) || (effect && k !== 'kind' && !EFFECT_ATTRIBUTES.has(k))) {
                continue;
            }
            if (REF_ATTRIBUTES.has(k) && v !== null) {
                if (isEntityId(v) && this.referable(v)) {
                    out[k] = this.mapped(v);
                } else {
                    dropped = true;
                    gone.push(k);
                }
            } else if (REF_ARRAY_ATTRIBUTES.has(k) && Array.isArray(v)) {
                const kept = v.filter((x) => isEntityId(x) && this.referable(x));
                dropped = dropped || kept.length !== v.length;
                out[k] = kept.map((x) => this.mapped(x as EntityId));
            } else {
                out[k] = v;
            }
        }
        if (dropped) {
            for (const k of FREE_TEXT_ATTRIBUTES) {
                if (Object.prototype.hasOwnProperty.call(out, k)) {
                    gone.push(k);
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete out[k];
                }
            }
        }
        if (inSet) {
            for (const k of gone) {
                out[k] = null;
            }
        }
        return canonicalAttrs(out);
    }

    /** The face-down attributes, the only ones an anonymous entity carries (SPEC §7.3, §11.1). */
    private faceDown(a: Attrs | undefined): Attrs {
        const out: Attrs = {};
        for (const [k, v] of Object.entries(a ?? {})) {
            if (isFaceDownAttribute(k)) {
                out[k] = v;
            }
        }
        return canonicalAttrs(out);
    }

    // ---- emitting --------------------------------------------------------------------------

    private emit(r: SwuRecord): void {
        this.out.push(r);
        if ((r.t === 'create' || r.t === 'reveal') && r.card !== undefined) {
            const owner = r.t === 'create' ? r.owner : this.entity(this.keyOf.get(r.e) as string)?.owner;
            this.given.push({ card: r.card, owner });
        }
    }

    private emitRemove(key: string): void {
        this.emit({ t: 'remove', e: this.idMap.get(key) as number });
        this.idMap.delete(key);
    }

    /** The entity as it is now, with its identity: what [R-03] (and [R-05]) create. */
    private emitKnownCreate(key: string, line: number | undefined): void {
        const e = this.entity(key) as Entity;
        const parent = e.parent === undefined ? undefined : this.mappedParent(e.parent, line);
        const a = this.mapAttrs(e.a, e, false);
        const rec: CreateRecord = { t: 'create', e: this.fresh(key), owner: e.owner as Seat };
        Object.assign(rec, fields(e.zone, e.owner, e.controller, parent, e.rel));
        if (e.card !== undefined) {
            rec.card = e.card;
        }
        if (e.to !== undefined) {
            rec.to = e.to;
        }
        if (Object.keys(a).length > 0) {
            rec.a = a;
        }
        this.emit(rec);
        this.status.set(key, 'known');
        this.forgotten.delete(key);
    }

    /** A face-down entity: no card, `to` its own seat, face-down attributes only ([R-02], [R-05]). */
    private emitAnonymousCreate(key: string, e: Entity, line: number | undefined): void {
        const parent = e.parent === undefined ? undefined : this.mappedParent(e.parent, line);
        const a = this.faceDown(e.a);
        const rec: CreateRecord = { t: 'create', e: this.fresh(key), owner: e.owner as Seat };
        Object.assign(rec, fields(e.zone, e.owner, e.controller, parent, e.rel));
        rec.to = [seatOf(e) as Seat];
        if (Object.keys(a).length > 0) {
            rec.a = a;
        }
        this.emit(rec);
        this.status.set(key, 'anonymous');
    }

    // ---- the steps -------------------------------------------------------------------------

    public handle(record: SwuRecord): void {
        if (typeof record !== 'object' || record === null) {
            return;
        }
        const line = lineOf(record);
        const key = 'e' in record ? String(record.e) : '';
        const before = record.t === 'set' || record.t === 'remove' ? this.entity(key) : undefined;
        const prevZone = before?.zone;
        const prevSeat = before === undefined ? undefined : seatOf(before);

        applyRecord(this.board, record, line);

        // [R-17] Step 0: a card leaves a hidden hand face down, and V loses track of every card it knew there.
        if (before !== undefined && prevZone === 'hand' && (this.viewer === null || prevSeat !== this.viewer)) {
            const leaves = record.t === 'remove' ||
              (record.t === 'set' && record.zone !== undefined && record.zone !== 'hand' && opponentSees(record.zone) !== 'public');
            if (leaves) {
                this.loseTrack(key, prevSeat);
            }
        }

        switch (record.t) {
            case 'create':
                return this.create(record, line);
            case 'reveal':
                return this.reveal(record, line);
            case 'set':
                return this.set(record, line, prevZone);
            case 'remove':
                return this.remove(record);
            case 'block':
                return this.block(record);
            case 'step':
                // [R-10] Step 10: a step is emitted unchanged.
                return this.emit({ ...record });
            default:
                // [R-13] A record whose type this version does not know is never copied.
                return;
        }
    }

    /** [R-17] Remove, in ascending output id, every known entity of that hand, the moving one included, and forget each. */
    private loseTrack(movingKey: string, seat: Seat | undefined): void {
        const keys = Object.keys(this.board.entities)
            .filter((k) => {
                const e = this.board.entities[k];
                return e.zone === 'hand' && seatOf(e) === seat;
            });
        if (!keys.includes(movingKey)) {
            keys.push(movingKey);
        }
        const known = keys.filter((k) => this.status.get(k) === 'known' && this.idMap.has(k))
            .sort((x, y) => (this.idMap.get(x) as number) - (this.idMap.get(y) as number));
        for (const k of known) {
            this.emitRemove(k);
            this.status.set(k, 'unmaterialized');
            this.forgotten.add(k);
        }
    }

    private create(r: CreateRecord, line: number | undefined): void {
        const key = String(r.e);
        const e = this.entity(key) as Entity;
        if (this.holds(e.to)) {
            // [R-01] Step 1: a create V is in the audience of: emitted, its card included. Known.
            const parent = r.parent === undefined ? undefined : this.mappedParent(r.parent, line);
            const out: CreateRecord = { ...r, e: this.fresh(key) };
            if (parent !== undefined) {
                out.parent = parent;
            }
            if (r.a !== undefined) {
                const a = this.mapAttrs(r.a, e, false);
                if (Object.keys(a).length > 0) {
                    out.a = a;
                } else {
                    delete out.a;
                }
            }
            this.emit(out);
            this.status.set(key, 'known');
            return;
        }
        // [R-02] Step 2: a create V is not in the audience of: anonymous, or nothing at all.
        if (this.unknownStatus(e) === 'anonymous') {
            this.emitAnonymousCreate(key, e, line);
        } else {
            this.status.set(key, 'unmaterialized');
        }
    }

    private reveal(r: RevealRecord, line: number | undefined): void {
        const key = String(r.e);
        if (!this.holds(r.to)) {
            // [R-04] Step 4: a reveal to others: nothing.
            return;
        }
        // [R-03] Step 3: a reveal to V.
        const st = this.status.get(key);
        if (st === 'known') {
            this.emit({ t: 'reveal', e: this.idMap.get(key) as number, card: r.card, to: r.to });
            return;
        }
        if (st === 'anonymous') {
            this.emitRemove(key);
        }
        this.emitKnownCreate(key, line);
    }

    private set(r: SetRecord, line: number | undefined, prevZone: string | undefined): void {
        const key = String(r.e);
        const e = this.entity(key) as Entity;
        if (!FIXED_IDS.has(key) && this.status.get(key) === 'anonymous' && r.zone !== undefined && r.zone !== prevZone) {
            // [R-06] Step 6: an anonymous entity changes zone: removed, then unmaterialized for step 5.
            this.emitRemove(key);
            this.status.set(key, 'unmaterialized');
        }
        if (!FIXED_IDS.has(key) && this.status.get(key) === 'unmaterialized') {
            // [R-05] Step 5: a set of an unmaterialized entity.
            if (this.forgotten.has(key) && this.holds(e.to) && opponentSees(e.zone) === 'public') {
                this.emitKnownCreate(key, line);
            } else if (this.unknownStatus(e) === 'anonymous') {
                this.emitAnonymousCreate(key, e, line);
            }
            return;
        }
        // [R-07] Step 7: any other set, with mapped ids; an anonymous entity keeps only face-down attributes.
        const anonymous = this.status.get(key) === 'anonymous';
        const out: SetRecord = { t: 'set', e: this.mapped(r.e) };
        if (r.zone !== undefined) {
            out.zone = r.zone;
        }
        if (r.owner !== undefined) {
            out.owner = r.owner;
        }
        if (r.controller !== undefined) {
            out.controller = r.controller;
        }
        if (r.parent !== undefined) {
            out.parent = r.parent === null ? null : this.mappedParent(r.parent, line);
        }
        if (r.rel !== undefined) {
            out.rel = r.rel;
        }
        if (r.a !== undefined) {
            const a = anonymous ? this.faceDown(r.a) : this.mapAttrs(r.a, e, true);
            if (Object.keys(a).length > 0) {
                out.a = a;
            }
        }
        if (Object.keys(out).length > 2) {
            this.emit(out);
        }
    }

    private remove(r: { t: 'remove'; e: number }): void {
        const key = String(r.e);
        const st = this.status.get(key);
        this.status.delete(key);
        this.forgotten.delete(key);
        // [R-08] Step 8: a remove of an unmaterialized entity emits nothing.
        if (st === 'known' || st === 'anonymous') {
            this.emitRemove(key);
        }
    }

    /** [R-09] Step 9: every block is kept, with only the references V may follow, mapped, and no `text` unless it is a `name` block's chosen name. */
    private block(r: BlockRecord): void {
        const out: BlockRecord = { ...r };
        const gone = new Set<string>();
        for (const f of BLOCK_SINGLE_REFS) {
            const v = r[f];
            if (v !== undefined) {
                if (this.referable(v)) {
                    out[f] = this.mapped(v);
                } else {
                    gone.add(f);
                }
            }
        }
        for (const f of BLOCK_LIST_REFS) {
            const v = r[f];
            if (v !== undefined) {
                const kept = v.filter((x) => this.referable(x));
                if (kept.length > 0) {
                    out[f] = kept.map((x) => this.mapped(x));
                } else {
                    gone.add(f);
                }
            }
        }
        if (r.kind !== 'name') {
            gone.add('text');
        }
        this.emit(Object.fromEntries(Object.entries(out).filter(([k]) => !gone.has(k))) as BlockRecord);
    }
}

/** The fixed fields of an emitted create, leaving out the absent ones. */
function fields(zone: string | undefined, owner: Seat | undefined, controller: Seat | undefined, parent: EntityId | undefined, rel: string | undefined): Partial<CreateRecord> {
    return {
        ...(zone !== undefined ? { zone } : {}),
        ...(owner !== undefined ? { owner } : {}),
        ...(controller !== undefined ? { controller } : {}),
        ...(parent !== undefined ? { parent } : {}),
        ...(rel !== undefined ? { rel } : {}),
    };
}

/** [R-11] The opponent's (in public, each) DECKS line: leaders, base, and the ids the output gave that seat's entities. */
function partialDeck(deck: DeckLine, given: readonly { card: string; owner: Seat | undefined }[]): DeckLine {
    const skip = new Set([...deck.leaders, deck.base]);
    const main: string[] = [];
    for (const g of given) {
        if (g.owner === deck.p && !g.card.startsWith('TOKEN:') && !skip.has(g.card) && !main.includes(g.card)) {
            main.push(g.card);
        }
    }
    return { p: deck.p, leaders: [...deck.leaders], base: deck.base, complete: false, main: main.map((id) => [id] as [string]) };
}

/** [R-11] The card ids the output mentions: header leaders and bases, DECKS, and each card and copyOf in RECORDS. */
function mentionedIds(header: Record<string, string>, decks: readonly DeckLine[], records: readonly SwuRecord[]): Set<string> {
    const ids = new Set<string>();
    for (const tag of ['P1Leader', 'P2Leader', 'P1Base', 'P2Base']) {
        if (header[tag] !== undefined) {
            header[tag].split(',').forEach((id) => ids.add(id));
        }
    }
    for (const d of decks) {
        d.leaders.forEach((id) => ids.add(id));
        ids.add(d.base);
        d.main.forEach((m) => ids.add(m[0]));
        (d.sideboard ?? []).forEach((m) => ids.add(m[0]));
    }
    for (const r of records) {
        if ((r.t === 'create' || r.t === 'reveal') && r.card !== undefined) {
            ids.add(r.card);
        }
        if (r.t === 'create' || r.t === 'set') {
            const copyOf = r.a?.copyOf;
            if (typeof copyOf === 'string') {
                ids.add(copyOf);
            }
        }
    }
    return ids;
}

/**
 * Redact a `full` file to the `perspective:V` file for seat V, or to the `public` file (SPEC §11).
 * Throws `not-full` on any other input ([R-12]) and `parent-rel` on a parent it cannot map
 * ([R-16]). The input is not changed.
 */
export function redact(file: SwuPgnFile, view: View): SwuPgnFile {
    // [R-12] Only a full file is redacted, never a file that was already redacted.
    if (file.header.Visibility !== 'full') {
        throw new SwuPgnError('not-full', `redact needs a full file, got Visibility "${file.header.Visibility ?? ''}"`);
    }
    const redactor = new Redactor(view);
    for (const record of file.records) {
        redactor.handle(record);
    }

    // [R-11] Step 11: the header, DECKS and CARDS. Only registered tags are kept: an extension tag never survives ([W-67]).
    const header: Record<string, string> = {};
    for (const [tag, value] of Object.entries(file.header)) {
        if (tag !== 'Seed' && isRegisteredHeaderTag(tag)) {
            header[tag] = value;
        }
    }
    header.Visibility = view === 'public' ? 'public' : `perspective:${view}`;

    const decks: DeckLine[] = file.decks.map((d) => {
        if (view !== 'public' && d.p === view) {
            const own: DeckLine = { ...d };
            delete own.order;
            return own;
        }
        return partialDeck(d, redactor.given);
    });

    const mentioned = mentionedIds(header, decks, redactor.out);
    const cards: CardLine[] = file.cards.filter((c) => mentioned.has(c.id)).map((c) => ({ ...c }));

    // [R-13] STORY, ANNOTATIONS and unknown sections are never copied.
    return { header, decks, cards, records: redactor.out, annotations: [], unknownSections: [] };
}
