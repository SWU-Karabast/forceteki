import type { CardInstanceState, SwuPgnDocument, GameEvent, ReducedState, Seat } from './types';
import type { NameResolver } from './cardNames';
import { baseId, flatten, indexResolver, shorten } from './cardNames';
import { isArena, isCompleteKeyframe } from './fold';
import { isTopLevelActionRecord } from './actionLinks';

const RULE_WIDTH = 78;

/** The longest story render() writes, in UTF-16 code units (spec §16): 16 MiB, the size of a file. */
const MAX_STORY_LENGTH = 16 * 1024 * 1024;

/** The line a story longer than MAX_STORY_LENGTH ends with (spec §16). */
const STORY_CUT = '… the story stops here: it is longer than 16777216 characters';

/** `x` if it is an array, else `[]`: a file is untrusted input and `cards: 5` must not throw. */
function arr(x: unknown): string[] {
    return Array.isArray(x) ? (x as string[]) : [];
}

function who(p: Seat | undefined): string {
    return p === 1 ? 'Player 1' : p === 2 ? 'Player 2' : '';
}

/** The renderer's resolver: names a card by the side that is up, and can still name its front. */
interface SidedResolver extends NameResolver {
    frontNameOf(id: string): string;
}

const ASPECTS = 'vigilance|command|aggression|cunning|villainy|heroism';
const capitalise = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

/**
 * `text` with each icon-markup token of spec §10.1 replaced by its plain text, because the story
 * is plain text (§16): `{keyword:restore:1}` -> `Restore 1`, `{resource:2}` -> `2 resources`,
 * `:aggression::heroism:` -> `Aggression Heroism`. Anything else is left as it is.
 */
export function plainText(text: string): string {
    return text
        .replace(/\{keyword:([a-z]+)(?::(\d+))?\}/g, (_m, name: string, n?: string) => capitalise(name) + (n ? ` ${n}` : ''))
        .replace(/\{resource:(\d+)\}/g, (_m, n: string) => `${n} ${n === '1' ? 'resource' : 'resources'}`)
        .replace(new RegExp(`(?::(?:${ASPECTS}):)+`, 'g'), (run) => run.split(':').filter((w) => w !== '')
            .map(capitalise)
            .join(' '));
}

/** Each `EffectDuration` as the words that close an `EFFECT_START` line (spec §16). */
function durationWords(duration: unknown, src: string, untilText: unknown, nm: (id: string) => string): string {
    switch (duration) {
        case 'attack': return 'for this attack';
        case 'phase': return 'for this phase';
        case 'round': return 'for this round';
        case 'whileSourceInPlay': return `while ${nm(src)} is in play`;
        // The file's text, cut like a card name, so it cannot grow the story (spec §16).
        case 'until': return `until ${typeof untilText === 'string' ? shorten(untilText) : 'a condition is met'}`;
        case 'delayed': return 'delayed';
        case 'game': return 'for the rest of the game';
        default: return String(duration);
    }
}

/** Each `EffectEndReason` as the words that close an `EFFECT_END` line (spec §16). */
function endWords(reason: unknown): string {
    switch (reason) {
        case 'expired': return 'expired';
        case 'fired': return 'it resolved';
        case 'sourceLeft': return 'its source left play';
        case 'targetLeft': return 'its target changed zone';
        case 'cancelled': return 'cancelled';
        default: return String(reason);
    }
}

/** Normative one-line rendering of a single event. `null` means "not part of the story". */
function line(e: GameEvent, n: SidedResolver, effectSources: ReadonlyMap<string, string> = new Map()): string | null {
    const nm = (id: string) => {
        if (typeof id === 'string' && id.startsWith('base@')) {
            return `${who(Number(id.slice(5)) as Seat)}'s base`;
        }
        return shorten(n.nameOf(id)) + shorten(copySuffix(id));
    };
    // ` · `, not `, `: a card's name has its own comma between title and subtitle, so a
    // comma-joined list cannot be split back into cards. The board lines use the same dot.
    const list = (ids: unknown): string => arr(ids).map(nm)
        .join(' · ');
    switch (e.t) {
        // `cost` is the PRINTED cost (spec §10.1), so it is worded as such: "(2 resources)"
        // read as resources paid, which is wrong whenever an aspect penalty or discount applied.
        case 'PLAY': case 'PLAY_SMUGGLE':
            return `${who(e.p)} plays ${nm(e.card)}${e.zone ? ` to ${e.zone}` : ''}${e.cost != null ? ` (cost ${e.cost})` : ''}`;
        // An attachment names its host rather than its arena: "plays Ascension Cable on Wampa".
        case 'PLAY_UPGRADE':
            return `${who(e.p)} plays ${nm(e.card)}${e.target ? ` on ${nm(e.target)}` : e.zone ? ` to ${e.zone}` : ''}${e.cost != null ? ` (cost ${e.cost})` : ''}`;
        case 'PLAY_EVENT': return `${who(e.p)} plays ${nm(e.card)}${e.cost != null ? ` (cost ${e.cost})` : ''}`;
        // A leader whose Leader Unit side is another card says which: "deploys Grand Moff
        // Tarkin, Tyrant of the Outer Rim as The Death Star, Icon of Tyranny".
        case 'DEPLOY_LEADER': {
            const unitSide = n.backNameOf?.(e.card);
            const leader = shorten(n.frontNameOf(baseId(e.card))) + shorten(copySuffix(e.card));
            return `${who(e.p)} deploys ${leader}${unitSide ? ` as ${shorten(unitSide)}${shorten(copySuffix(e.card))}` : ''}${e.target ? ` as a pilot on ${nm(e.target)}` : ''}`;
        }
        // A double-sided leader flipping is a real, visible beat -- its title, aspects and
        // traits all change -- and no other line implies it, so it is story, not mechanism.
        case 'LEADER_FLIP': {
            // Named by the face it left, then the face it landed on, when the index has both.
            const front = n.frontNameOf(baseId(e.card));
            const back = n.backNameOf?.(e.card);
            return `${who(e.p)} flips ${nm(e.card)}${back ? ` to ${shorten(e.onStartingSide ? front : back)}` : ''}`;
        }
        case 'ATTACK': return `${who(e.p)} attacks ${e.defenderType === 'base' ? `${who(e.p === 1 ? 2 : 1)}'s base` : nm(e.def)} with ${nm(e.atk)}`;
        case 'PASS': return `${who(e.p)} passes`;
        case 'CLAIM_INITIATIVE': return `${who(e.p)} claims initiative`;
        case 'DAMAGE': return `${e.amt} damage to ${nm(e.tgt)} — ${e.hp} HP left`;
        case 'OVERWHELM': return `${e.amt} Overwhelm damage to ${who(e.p === 1 ? 2 : 1)}'s base — ${e.hp} HP left`;
        case 'HEAL': return `${e.amt} healed on ${nm(e.tgt)} — ${e.hp} HP left`;
        case 'DEFEAT': return `${nm(e.card)} is defeated${e.defeatedBy ? ` by ${nm(e.defeatedBy)}` : ''}`;
        // An action ability is the player's own action for the turn, so it reads like one
        // ("Player 2 uses Director Krennic"); every other kind happened TO a card. A granted
        // ability names its grantor, because the card using it has no such text of its own
        // ("Player 1 uses Player 1's base (granted by Heavy Ion Cannon)").
        // An ability another card's ability made the player use names that card too
        // ("Wampa uses an ability (used by Chimaera)").
        case 'ABILITY_ACTIVATE': {
            const granted = (e.grantedBy ? ` (granted by ${nm(e.grantedBy)})` : '') + (e.usedBy ? ` (used by ${nm(e.usedBy)})` : '');
            return e.kind === 'action' || e.kind === 'epic'
                ? `${who(e.p)} uses ${nm(e.card)}${e.kind === 'epic' ? '\'s Epic Action' : ''}${granted}`
                : `${nm(e.card)} uses an ability${granted}`;
        }
        case 'TRIGGER': return `${nm(e.card)} triggers`;
        // Handled by the caller, which gives it its own marker line rather than a story line.
        case 'UNDO': return null;
        case 'STATUS_TOKEN': return `${nm(e.card)} ${e.count < 0 ? 'loses' : 'gains'} ${Math.abs(e.count)} ${e.token}`;
        case 'SHIELD_GAIN': return `${nm(e.card)} gains ${e.count ?? 1} shield`;
        case 'SHIELD_USE': return `${nm(e.card)} loses ${e.count ?? 1} shield`;
        case 'EXPERIENCE_GAIN': return `${nm(e.card)} ${e.count < 0 ? 'loses' : 'gains'} ${Math.abs(e.count)} experience`;
        case 'DRAW': return `${who(e.p)} draws ${e.count}${arr(e.cards).length ? `: ${list(e.cards)}` : ''}`;
        case 'DISCARD': return `${who(e.p)} discards ${list(e.cards)}`;
        case 'RESOURCE': return `${who(e.p)} resources ${nm(e.card)}`;
        case 'REVEAL': return `${who(e.p)} reveals ${list(e.cards)}`;
        // A look names whose zone it was and, in an omniscient file, the cards seen.
        case 'LOOK': {
            const seen = arr(e.cards).length ? `: ${list(e.cards)}` : '';
            return `${who(e.p)} looks at ${e.count} ${e.count === 1 ? 'card' : 'cards'} of ${who(e.owner)}'s ${e.zone}${seen}`;
        }
        // The name is the file's text, not an id: cut like a card name, so it cannot grow the story.
        case 'NAME': return `${who(e.p)} names ${shorten(String(e.name))}`;
        case 'SEARCH': return e.found ? `${who(e.p)} searches, finds ${list(e.found)}` : `${who(e.p)} searches their deck`;
        case 'CREATE_TOKEN': return `${who(e.p)} creates ${nm(e.token)} in ${e.zone}`;
        case 'CAPTURE': return `${who(e.p)} captures ${nm(e.card)}${e.by ? ` with ${nm(e.by)}` : ''}`;
        case 'RESCUE': return `${who(e.p)} rescues ${nm(e.card)}`;
        case 'TAKE_CONTROL': return `${who(e.p)} takes control of ${nm(e.card)}`;
        case 'MULLIGAN': return `${who(e.p)} mulligans`;
        case 'KEEP_HAND': return `${who(e.p)} keeps their hand`;
        // An effect names its source card, then what it does in words when the file says, then
        // what it applies to: the targets, or the seat a player-wide effect is for.
        case 'EFFECT_START': {
            const what = e.text ? ` — ${shorten(plainText(String(e.text)))}` : '';
            const on = arr(e.targets).length ? ` on ${list(e.targets)}` : e.seat === 1 || e.seat === 2 ? ` for ${who(e.seat)}` : e.seat === 'both' ? ' for both players' : '';
            return `${who(e.p)}: ${nm(e.src)}${what}${on} (${durationWords(e.duration, e.src, e.untilText, nm)})`;
        }
        // Named by the source its EFFECT_START gave, or by its id when the file never started it.
        case 'EFFECT_END': {
            const src = effectSources.get(e.id);
            const which = src !== undefined ? `Effect from ${nm(src)}` : `Effect ${e.id}`;
            const on = arr(e.targets).length ? ` on ${list(e.targets)}` : '';
            return `${which} ends${on} (${endWords(e.reason)})`;
        }
        case 'GAME_END': return `*** ${e.winner === 'Draw' ? 'Game ends in a draw' : `${who(e.winner)} wins`} — ${e.reason} ***`;
        // Mechanism, not story: these are how the board changes, and each is already implied
        // by the action it sits under. MOVE in particular is the fold's source of truth and
        // would triple the length of the narrative for no reader benefit; the resource
        // counters fire on every play and every regroup.
        case 'CHOICE': case 'PHASE_END': case 'ROUND_END': case 'SHUFFLE':
        case 'MODAL_CHOICE': case 'MOVE': case 'EXHAUST': case 'READY':
        case 'EXHAUST_RESOURCES': case 'READY_RESOURCES': case 'STATS': case 'ABILITY_RESET':
            return null;
        case 'PHASE_START': return null;       // handled as a banner below
        case 'ROUND_START': return null;       // handled as a banner below
        default: { const _exhaustive: never = e; void _exhaustive; return null; }
    }
}

/** `"ASH#110:2"` -> `" #2"`, so two copies of a card are distinguishable in the prose. */
function copySuffix(ref: string): string {
    const m = (/:(\d+)$/).exec(String(ref));
    return m ? ` #${m[1]}` : '';
}

/** The copied name a unit that is a copy goes by (spec §16), cut like a card name; else undefined. */
function copyName(c: Pick<CardInstanceState, 'copyOf' | 'name'>): string | undefined {
    return typeof c.copyOf === 'string' && typeof c.name === 'string' ? shorten(c.name) : undefined;
}

/**
 * Keep `copies` (unit id -> copied name) in step with the records that start and end a copy: a
 * `STATS` states the whole attribute set, so one without `copyOf` ends it, and a unit leaving play
 * starts over.
 */
function trackCopies(e: GameEvent, copies: Map<string, string>): void {
    if (e.t === 'STATS') {
        const name = copyName(e);
        if (name !== undefined) {
            copies.set(e.card, name);
        } else {
            copies.delete(e.card);
        }
    } else if (e.t === 'MOVE' && isArena(e.from) && !isArena(e.to)) {
        copies.delete(e.card);
    }
}

/**
 * The board at a round boundary, from that round's keyframe — the single most useful thing
 * for a human, because it lets them re-sync their mental model without replaying deltas.
 * No new data: this is the keyframe the file already carries, laid out to be read.
 */
function boardSummary(k: ReducedState, n: NameResolver): string[] {
    const nm = (id: string) => shorten(n.nameOf(id)) + shorten(copySuffix(id));
    const out: string[] = [];
    for (const seat of [1, 2] as Seat[]) {
        const p = k.players[seat];
        if (!p) {
            out.push(` P${seat}  (not recorded)`);
            continue;
        }
        // Resources read ready/total; deck and the leader's status appear when the file has them.
        const total = p.resourcesReady + (p.resourcesExhausted ?? 0);
        let line = ` P${seat}  base ${p.baseHp}/${p.baseMaxHp}   hand ${p.handSize}   resources ${p.resourcesReady}/${total}`;
        if (typeof p.deckSize === 'number') {
            line += `   deck ${p.deckSize}`;
        }
        if (p.leader) {
            line += `   leader ${p.leader.deployed ? 'deployed' : p.leader.exhausted ? 'exhausted' : 'ready'}`;
        }
        out.push(line);
        // The base's own attachments (Fortify) and captives (Arrest) come first: they are on the
        // base, not in an arena. A captive reads "holds X", as on a unit.
        const onBase = [...arr(p.baseUpgrades).map(nm), ...arr(p.baseCaptured).map((id) => `holds ${nm(id)}`)];
        if (onBase.length > 0) {
            out.push(`      base: ${onBase.join('  ·  ')}`);
        }
        for (const zone of ['ground', 'space']) {
            const inZone = p.cards.filter((c) => c.zone === zone);
            if (inZone.length === 0) {
                continue;
            }
            const rendered = inZone.map((c) => {
                const bits: string[] = [];
                // Live stats first, as the engine computed them, so a buffed unit reads right.
                const stats = typeof c.power === 'number' && typeof c.hp === 'number' ? ` ${c.power}/${c.hp}` : '';
                if (c.damage) {
                    bits.push(`${c.damage} dmg`);
                }
                if (c.exhausted) {
                    bits.push('exhausted');
                }
                if (c.shields) {
                    bits.push(`${c.shields} shield`);
                }
                if (c.experience) {
                    bits.push(`${c.experience} xp`);
                }
                for (const [token, count] of Object.entries(c.statusTokens ?? {})) {
                    bits.push(`${count} ${token}`);
                }
                for (const up of c.upgrades ?? []) {
                    bits.push(nm(up));
                }
                for (const held of c.captured ?? []) {
                    bits.push(`holds ${nm(held)}`);
                }
                // A copy goes by the name it copied (CR 8.5).
                const copied = copyName(c);
                return (copied !== undefined ? copied + shorten(copySuffix(c.id)) : nm(c.id)) + stats + (bits.length ? ` [${bits.join(', ')}]` : '');
            });
            out.push(`      ${zone}: ${rendered.join('  ·  ')}`);
        }
    }
    return out;
}

/** Move a card's shown side with the records that turn it over (see `render`). */
function trackSides(e: GameEvent, backUp: Set<string>, names: NameResolver): void {
    if (e.t === 'DEPLOY_LEADER' && names.backNameOf?.(baseId(e.card))) {
        backUp.add(e.card);
    } else if (e.t === 'MOVE' && e.to === 'base' && isArena(e.from)) {
        backUp.delete(e.card);        // a Leader Unit going home shows its front again
    } else if (e.t === 'MOVE' && e.from === 'base' && isArena(e.to) && names.backNameOf?.(baseId(e.card))) {
        backUp.add(e.card);           // a leader leaving the base zone for an arena deployed
    } else if (e.t === 'LEADER_FLIP' && names.backNameOf?.(baseId(e.card))) {
        if (e.onStartingSide) {
            backUp.delete(e.card);
        } else {
            backUp.add(e.card);
        }
    }
}

/**
 * Render the human-readable story of a game.
 *
 * `names` is optional: when omitted, the document's own `%%% CARDS` index is used, so a file
 * that carries one renders with real card names and needs no external card database.
 */
export function render(doc: SwuPgnDocument, names?: NameResolver): string {
    const base = names ?? indexResolver(doc.cards);
    // Which cards currently show their OTHER side (CardIndexRecord.backSideName): a deployed
    // leader whose Leader Unit side is another card, a double-sided leader flipped. A card is
    // named by the side that is up, so a deployed Tarkin attacks as The Death Star.
    const backUp = new Set<string>();
    // Units that are a copy of another card (CR 8.5), by id: named by the copied name while it lasts.
    const copies = new Map<string, string>();
    const n: SidedResolver = {
        // Sides are tracked per copy (a mirror match has two of one leader), names per card.
        nameOf: (id) => copies.get(id) ?? (backUp.has(id) ? base.backNameOf?.(baseId(id)) : undefined) ?? base.nameOf(baseId(id)),
        backNameOf: (id) => base.backNameOf?.(baseId(id)),
        frontNameOf: (id) => base.nameOf(baseId(id)),
    };
    const out: string[] = [];
    // The story's size so far, in UTF-16 code units with a line feed per line: a file names a
    // card in a few bytes and the story in up to 120 characters, so it is capped (spec §16).
    let size = 0;
    const put = (...lines: string[]) => {
        for (const l of lines) {
            out.push(l);
            size += l.length + 1;
        }
    };
    let actionNum = 0;
    // Effect id -> source card, so an EFFECT_END (which carries only the id) can name it.
    const effectSources = new Map<string, string>();
    for (const e of doc.events) {
        if (size > MAX_STORY_LENGTH) {
            out.push(STORY_CUT);
            break;
        }
        if (e.t === 'EFFECT_START' && typeof e.id === 'string' && typeof e.src === 'string') {
            effectSources.set(e.id, e.src);
        }
        if (e.t === 'ROUND_START' && isCompleteKeyframe(e.keyframe)) {
            // A keyframe states each leader's status, so the sides snap to it like the board does.
            for (const seat of [1, 2] as Seat[]) {
                const leader = e.keyframe.players[seat]?.leader;
                if (leader && base.backNameOf?.(baseId(leader.id))) {
                    if (leader.deployed || leader.onStartingSide === false) {
                        backUp.add(leader.id);
                    } else {
                        backUp.delete(leader.id);
                    }
                }
            }
            // So do the copies: the keyframe states every unit's attributes.
            copies.clear();
            for (const seat of [1, 2] as Seat[]) {
                for (const c of e.keyframe.players[seat]?.cards ?? []) {
                    const copied = copyName(c);
                    if (copied !== undefined) {
                        copies.set(c.id, copied);
                    }
                }
            }
        }
        if (e.t === 'ROUND_START') {
            put('', '═'.repeat(RULE_WIDTH));
            const left = ` ROUND ${e.round}`;
            // Only a complete keyframe is laid out; a damaged one is not a board (spec §13).
            const keyframe = isCompleteKeyframe(e.keyframe) ? e.keyframe : undefined;
            const right = keyframe?.initiative ? `initiative: ${who(keyframe.initiative)} ` : '';
            put(right ? left.padEnd(RULE_WIDTH - right.length) + right : left);
            if (keyframe) {
                put(...boardSummary(keyframe, n));
            }
            put('═'.repeat(RULE_WIDTH), '');
            actionNum = 0;
            continue;
        }
        // Neither an action nor a consequence: the records it retracted are gone from the file,
        // so it is a mark in the margin saying the narrative below was replayed from here.
        if (e.t === 'UNDO') {
            put(`    ·· ${e.by ? who(e.by) : 'A player'} undid back to ${e.at} ··`);
            continue;
        }
        if (e.t === 'PHASE_START') {
            put(` ── ${e.phase} ──`);
            actionNum = 0;
            continue;
        }
        const text = line(e, n, effectSources);
        trackSides(e, backUp, base);
        trackCopies(e, copies);
        if (text == null) {
            continue;
        }
        // Events a player CHOSE to do get a number; everything else is a consequence of the
        // numbered action above it and is printed indented underneath. This mirrors the `seq`
        // scheme, where a top-level action is `R2.A.3` and its consequences are `R2.A.3a`,
        // `R2.A.3b`, … — the causal grouping is already in the data, and indenting shows it.
        if (isTopLevelActionRecord(e)) {
            actionNum += 1;
            put(` ${String(actionNum).padStart(2)}. ${text}`);
        } else {
            put(`       ↳ ${text}`);
        }
    }
    // Every story line is one line, whatever a file put in a field it prints (spec §16, R-04).
    return out.map(flatten).join('\n');
}
