import type { Attrs, AttrValue, Audience, Entity, Seat } from '@swupgn/format';
import type { Card } from '../card/Card';
import type { Game } from '../Game';
import type { Player } from '../Player';
import { EffectName, ZoneName } from '../Constants';
import { Contract } from '../utils/Contract';
import { EnumHelpers } from '../utils/EnumHelpers';
import { cardIdOf } from './SwuPgnCardIds';
import type { SwuPgnWriterState } from './SwuPgnWriterState';

/**
 * The SWU-PGN zone for each engine zone; null for a zone that holds no entities here.
 * A Record, so a new engine zone fails to compile until it is mapped.
 */
const zoneNameOf: Record<ZoneName, string | null> = {
    [ZoneName.Base]: 'base',
    [ZoneName.Capture]: 'captured',
    [ZoneName.Deck]: 'deck', // only a temporary entity: a deck card someone is looking at (W-24)
    [ZoneName.Discard]: 'discard',
    [ZoneName.GroundArena]: 'ground',
    [ZoneName.Hand]: 'hand',
    [ZoneName.OutsideTheGame]: 'setAside',
    [ZoneName.Resource]: 'resource',
    [ZoneName.SpaceArena]: 'space',
};

/** The SWU-PGN zone name of an engine zone, or null for a zone that holds no entities. */
export function swuPgnZoneOf(zoneName: ZoneName): string | null {
    return zoneNameOf[zoneName] ?? null;
}

export type SeatOf = (player: Player) => Seat | null;

/** A card's `abilityUses`, or undefined when it has none. */
export type AbilityUsesOf = (card: Card) => AttrValue[] | undefined;

/** Who knows each card on this board, and which deck cards are temporary entities (from the AudienceTracker). */
export interface ICardAudiences {

    /** `owner` is the card owner's seat, which the caller has already resolved. */
    audienceFor(card: Card, zone: string, owner: Seat): Audience;
    readonly viewedDeckCards: ReadonlySet<Card>;
}

/** The player's seat: the first player is seat 1, the second seat 2; null for anyone else. */
export function seatIn(game: Game, player: Player | null): Seat | null {
    return seatAmong(game.getPlayers(), player);
}

/** `seatIn` over a player list read once: a projection resolves the seats once, not once per card. */
export function seatAmong(players: readonly Player[], player: Player | null): Seat | null {
    if (player == null) {
        return null;
    }
    return player === players[0] ? 1 : player === players[1] ? 2 : null;
}

/** Adds one entity per tracked card and token to `entities`, keyed by entity id. */
export function projectCards(
    cards: readonly Card[],
    state: SwuPgnWriterState,
    seatOf: SeatOf,
    abilityUsesOf: AbilityUsesOf,
    audiences: ICardAudiences,
    entities: Record<string, Entity>
): void {
    for (const card of cards) {
        const zone = zoneOfEntity(card, audiences);
        if (zone !== null) {
            entities[String(idOf(card, state))] = projectCardEntity(card, zone, state, seatOf, abilityUsesOf, audiences);
        }
    }
}

/** One card's entity in `zone` (what `zoneOfEntity` gave), its `abilityUses` included. */
export function projectCardEntity(
    card: Card,
    zone: string,
    state: SwuPgnWriterState,
    seatOf: SeatOf,
    abilityUsesOf: AbilityUsesOf,
    audiences: ICardAudiences
): Entity {
    const entity = projectCard(card, zone, state, seatOf, audiences);
    const uses = abilityUsesOf(card);
    if (uses !== undefined) {
        entity.a.abilityUses = uses;
    }
    return entity;
}

/** The card's entity id when `entities` (a board `projectCards` filled) holds it; undefined otherwise, and no id is assigned. */
export function projectedCardId(card: Card, state: SwuPgnWriterState, entities: Record<string, Entity>): number | undefined {
    const key = state.cardKey(card);
    if (!state.hasEntity(key)) {
        return undefined;
    }
    const id = state.entityIdFor(key);
    return String(id) in entities ? id : undefined;
}

/** The audience of the card's identity: its entity's `to`, or its owner alone for a card with no entity (in a deck). */
export function cardAudience(card: Card, seatOf: SeatOf, audiences: ICardAudiences): Audience {
    const zone = zoneOfEntity(card, audiences);
    const owner = seat(card.owner, seatOf);
    return zone === null ? [owner] : audiences.audienceFor(card, zone, owner);
}

function idOf(card: Card, state: SwuPgnWriterState): number {
    return state.entityIdFor(state.cardKey(card));
}

/** The entity's zone, or null when the card has no entity. */
export function zoneOfEntity(card: Card, audiences: ICardAudiences): string | null {
    if (card.zone == null) {
        return null; // a token removed from the game
    }
    if (card.isForceToken() || card.isCreditToken()) {
        return null; // seat attributes, not entities
    }
    if (card.isToken() && card.zoneName === ZoneName.OutsideTheGame) {
        return null; // a token that left play (W-25)
    }
    if (card.zoneName === ZoneName.Deck && !audiences.viewedDeckCards.has(card)) {
        return null; // a deck card nobody is looking at is only the seat's deckCount
    }
    return zoneNameOf[card.zoneName];
}

function seat(player: Player, seatOf: SeatOf): Seat {
    const result = seatOf(player);
    Contract.assertNotNullLike(result, `SWU-PGN: player ${player.name} has no seat`);
    return result;
}

function projectCard(card: Card, zone: string, state: SwuPgnWriterState, seatOf: SeatOf, audiences: ICardAudiences): Entity {
    const owner = seat(card.owner, seatOf);
    const entity: Entity = { zone, owner, a: {} };

    // a captured card is held by the captor but stays its owner's (W-29: controller absent)
    const controller = card.zoneName === ZoneName.Capture ? owner : seat(card.controller, seatOf);
    if (controller !== owner) {
        entity.controller = controller;
    }

    const parent = parentOf(card);
    if (parent) {
        entity.parent = idOf(parent.card, state);
        entity.rel = parent.rel;
    }

    entity.card = cardIdOf(card);
    entity.to = audiences.audienceFor(card, zone, owner);
    entity.a = attributesOf(card);
    return entity;
}

/** The card that holds this one on the board (W-28), and how; null for a card that no card holds. */
export function parentOf(card: Card): { card: Card; rel: 'attached' | 'pilot' | 'captured' } | null {
    const zone = card.zone;
    if (zone.name === ZoneName.Capture) {
        // a captor that has left play rescues its captives (CR: immediately), but the engine does so in a later event
        // window: until then the captive is held by no card, since a parent must be in an arena or the base zone (W-28)
        const captor = zone.captor;
        return EnumHelpers.isArena(captor.zoneName) || captor.zoneName === ZoneName.Base ? { card: captor, rel: 'captured' } : null;
    }
    if (card.canBeInPlay() && card.isInPlay() && card.isAttached()) {
        // a pilot is a unit or leader attached to a vehicle (NonLeaderUnitUpgrade, LeaderUpgrade)
        return { card: card.parentCard, rel: EnumHelpers.isUnitUpgrade(card.type) ? 'pilot' : 'attached' };
    }
    return null;
}

function isLeaderCard(card: Card): boolean {
    // not card.isLeader(): a vehicle piloted by a leader answers true to that
    return card.isDeployableLeader() || card.isDoubleSidedLeader();
}

/** What the card is now (SPEC §7.3 Kinds). */
function kindOf(card: Card): string {
    if (card.isToken()) {
        return 'token';
    }
    if (isLeaderCard(card)) {
        return 'leader';
    }
    if (card.isBase()) {
        return 'base';
    }
    if (card.isEvent()) {
        return 'event';
    }
    if (card.isUpgrade()) {
        return 'upgrade'; // also a unit attached as a pilot
    }
    if (card.isUnit()) {
        return 'unit';
    }
    Contract.fail(`SWU-PGN: cannot classify card ${card.internalName} of type ${card.type}`);
}

/**
 * The card's attributes, each only on the entities the registry's `on` names: `unit` is a unit in an arena
 * (a deployed leader and a token unit included, an attached pilot not), `upgrade` an attached upgrade,
 * `leader` a leader card in any zone, `base` a base, `resource` a card in the resource row.
 * A card in hand, discard, a capture zone or set aside carries only its identity attributes (`kind`, `aspects`,
 * `cost`, `name`): the engine holds no other state for it there. Zone checks guard the accessors that throw outside their zones.
 */
function attributesOf(card: Card): Attrs {
    const a: Attrs = { kind: kindOf(card) };

    const isResource = card.zoneName === ZoneName.Resource;
    const isLeader = isLeaderCard(card);
    const isUnit = EnumHelpers.isArena(card.zoneName) && card.isUnit();
    const isUpgrade = card.canBeInPlay() && card.isInPlay() && card.isAttached() && !isLeader;

    // an attached pilot, leader or not, has no ready state in the engine (UnitProperties.updateStateOnAttach)
    if ((isResource || isUnit || (isLeader && card.zoneName === ZoneName.Base)) && card.canBeExhausted()) {
        a.exhausted = card.exhausted;
    }

    if (isUnit && card.isUnit()) {
        a.damage = card.damage;
        a.power = card.getPower();
        a.hp = card.getHp();
        const keywords = card.keywords.map((keyword) => (keyword.hasNumericValue() ? `${keyword.name} ${keyword.value}` : keyword.name)).sort();
        if (keywords.length > 0) {
            a.keywords = keywords;
        }
    } else if (card.isBase()) {
        a.damage = card.damage;
        a.hp = card.getHp();
    }

    if (isUnit || isUpgrade) {
        const traits = [...card.traits].sort();
        if (traits.length > 0) {
            a.traits = traits;
        }
    }

    const aspects = card.aspects;
    if (aspects.length > 0) {
        a.aspects = [...aspects];
    }
    if (card.hasCost()) {
        a.cost = card.printedCost;
    }

    const name = displayName(card.title, card.subtitle);
    if (name !== displayName(card.printedTitle, card.printedSubtitle)) {
        a.name = name;
    }

    if (isUnit && card.isUnit()) {
        if (card.isFullyBlanked()) {
            a.blank = true;
        }
        if (card.isLeaderUnit() && !isLeader) {
            a.leaderUnit = true;
        }
        if (card.isClonedUnit) {
            const copied = card.getOngoingEffectValues<Card>(EffectName.CloneUnit)[0];
            if (copied) {
                a.copyOf = cardIdOf(copied);
            }
        }
    }

    if (card.isDeployableLeader()) {
        a.deployed = card.deployed;
        a.epicActionUsed = card.epicActionSpent;
    }
    if (card.isDoubleSidedLeader()) {
        a.onStartingSide = card.onStartingSide;
    }

    if (card.isBase()) {
        if (card.hasEpicAction) {
            a.epicActionUsed = card.epicActionSpent;
        }
        a.defeated = card.defeated || card.damage >= card.getHp();
    }
    return a;
}

/** The CARDS line form of a name: `Title, Subtitle`. */
function displayName(title: string, subtitle: string | null | undefined): string {
    return subtitle ? `${title}, ${subtitle}` : title;
}
