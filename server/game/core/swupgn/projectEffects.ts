import type { Attrs, AttrValue, Audience, Entity, Seat } from '@swupgn/format';
import type { AbilityLimit } from '../ability/AbilityLimit';
import { PerGameAbilityLimit, PerPlayerPerGameAbilityLimitBase, RepeatableAbilityLimit } from '../ability/AbilityLimit';
import type { Card } from '../card/Card';
import { Duration, EffectName } from '../Constants';
import type { Game } from '../Game';
import type { OngoingEffect } from '../ongoingEffect/OngoingEffect';
import type { Player } from '../Player';
import { Contract } from '../utils/Contract';
import { seatIn } from './projectCards';
import type { SwuPgnWriterState } from './SwuPgnWriterState';

/** The registry's `duration` for each engine duration; `Persistent` reaches here only for a lasting effect. */
const durationNameOf: Record<Duration, string> = {
    [Duration.Custom]: 'until',
    [Duration.Persistent]: 'game',
    [Duration.UntilEndOfAttack]: 'attack',
    [Duration.UntilEndOfPhase]: 'phase',
    [Duration.UntilEndOfRound]: 'round',
    [Duration.WhileSourceInPlay]: 'whileSourceInPlay',
};

/** The entity id of a card that has an entity on this board, undefined otherwise. */
export type CardEntityId = (card: Card) => number | undefined;

/** The tracked audience of a card's identity now. */
export type CardAudienceOf = (card: Card) => Audience;

/**
 * One entity per lasting or delayed effect while it lasts (W-31), keyed `effect:${uuid}`.
 * Constant abilities' effects are card state, not entities. A target with no entity is left out of `targets`.
 */
export function projectEffects(game: Game, state: SwuPgnWriterState, cardEntityId: CardEntityId, cardAudienceOf: CardAudienceOf): Record<string, Entity> {
    const entities: Record<string, Entity> = {};
    for (const effect of game.ongoingEffectEngine.effects) {
        if (isRecorded(effect) && effect.source.isCard()) {
            const key = `effect:${effect.uuid}`;
            if (!state.hasEntity(key)) {
                // the audience is the source's at creation (W-31), frozen in state on first sight
                state.widen(key, cardAudienceOf(effect.source));
            }
            const id = state.entityIdFor(key);
            entities[String(id)] = projectEffect(effect, effect.source, key, game, state, cardEntityId);
        }
    }
    return entities;
}

function isRecorded(effect: OngoingEffect): boolean {
    if (!effect.isEffectActive()) {
        return false;
    }
    return isDelayed(effect) || effect.duration !== Duration.Persistent || effect.ongoingEffect.isLastingEffect === true;
}

function isDelayed(effect: OngoingEffect): boolean {
    return effect.impl.type === EffectName.DelayedEffect;
}

function seatOrFail(game: Game, player: Player): Seat {
    const seat = seatIn(game, player);
    Contract.assertNotNullLike(seat, `SWU-PGN: player ${player.name} has no seat`);
    return seat;
}

function projectEffect(effect: OngoingEffect, source: Card, key: string, game: Game, state: SwuPgnWriterState, cardEntityId: CardEntityId): Entity {
    const frozen = state.audienceOf(key);
    const to: Audience = frozen.length === 2 ? 'all' : frozen;

    const a: Attrs = { kind: 'effect' };
    const src = cardEntityId(source);
    if (src !== undefined) {
        a.src = src;
    }
    a.targets = targetsOf(effect, game, cardEntityId);
    a.duration = durationOf(effect);
    return { owner: seatOrFail(game, source.controller), to, a };
}

function targetsOf(effect: OngoingEffect, game: Game, cardEntityId: CardEntityId): AttrValue[] {
    const targets: AttrValue[] = [];
    for (const target of effect.targets) {
        if (target.isCard()) {
            const id = cardEntityId(target);
            if (id !== undefined) {
                targets.push(id);
            }
        } else if (target.isPlayer()) {
            targets.push(`p${seatOrFail(game, target)}`);
        }
    }
    return targets;
}

function durationOf(effect: OngoingEffect): string {
    if (isDelayed(effect)) {
        return 'delayed';
    }
    const name = effect.duration == null ? undefined : durationNameOf[effect.duration];
    Contract.assertNotNullLike(name, `SWU-PGN: no registry duration for effect duration '${effect.duration}' (${effect.source.internalName})`);
    return name;
}

/**
 * The card's `abilityUses`: one entry per limited action or triggered ability used at least once this phase,
 * round or game, by the seat that used it; undefined when there is none, so the attribute is deleted (W-32).
 *
 * The abilities are read unfiltered (`getAllAbilitiesForRecording`): blanking hides an ability but does not reset
 * its uses. A `PerGameAbilityLimit` counts for the card whoever used it, so its count goes to the card's controller.
 * A gained ability whose grant has ended is no longer on the card, so its held uses are not listed.
 */
export function abilityUsesOf(card: Card, game: Game): AttrValue[] | undefined {
    const uses: AttrValue[] = [];
    const abilities = new Set(card.getAllAbilitiesForRecording());
    for (const player of game.getPlayers()) {
        const seat = seatIn(game, player);
        if (seat === null) {
            continue;
        }
        const listed = new Set<string>();
        for (const ability of abilities) {
            const limit = ability.captureLimit();
            if (limit == null || (limit instanceof PerGameAbilityLimit && card.controller !== player)) {
                continue;
            }
            const recorded = limitRecordOf(limit, player);
            if (!recorded || recorded.count <= 0 || listed.has(ability.abilityIdentifier)) {
                continue;
            }
            listed.add(ability.abilityIdentifier);
            uses.push({ ability: ability.abilityIdentifier, seat, count: recorded.count, per: recorded.per, max: recorded.max });
        }
    }
    return uses.length > 0 ? uses : undefined;
}

/**
 * A limit's uses by `player` as the format counts them, or undefined for a limit it does not count: an unlimited
 * ability, the Epic Action (`epicActionUsed` carries it), and a repeatable limit reset by anything but a phase's
 * or a round's end. `max` is the engine's per-player modified maximum.
 */
function limitRecordOf(limit: AbilityLimit, player: Player): { count: number; max: number; per: 'phase' | 'round' | 'game' } | undefined {
    if (limit.isEpicActionLimit()) {
        return undefined;
    }
    let record: { count: number; max: number; per: 'phase' | 'round' | 'game' | undefined };
    if (limit instanceof PerGameAbilityLimit) {
        record = { count: limit.currentForPlayer(), max: limit.maxForPlayer(), per: 'game' };
    } else if (limit instanceof PerPlayerPerGameAbilityLimitBase) {
        const per = limit instanceof RepeatableAbilityLimit ? limit.resetsOn : 'game';
        record = { count: limit.currentForPlayer(player), max: limit.maxForPlayer(player), per };
    } else {
        return undefined;
    }
    const { count, max, per } = record;
    if (per === undefined || !Number.isInteger(max) || max < 1) {
        return undefined;
    }
    return { count, max, per };
}
