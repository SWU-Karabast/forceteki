import { OngoingEffect } from './OngoingEffect';
import type { CardTypeFilter, RelativePlayerFilter, ZoneFilter } from '../Constants';
import { RelativePlayer, WildcardZoneName, WildcardCardType, EffectName } from '../Constants';
import { EnumHelpers } from '../utils/EnumHelpers';
import { Contract } from '../utils/Contract';
import { Helpers } from '../utils/Helpers';
import type { Game } from '../Game';
import type { Card } from '../card/Card';
import type { IOngoingCardEffectProps } from '../../Interfaces';
import type { OngoingEffectImpl } from './effectImpl/OngoingEffectImpl';
import type { AbilityContext } from '../ability/AbilityContext';
import { registerState, type GameObjectId } from '../GameObjectUtils';

interface IAttackableCandidateCache {
    allCardIds: readonly GameObjectId<Card>[];
    allCardCount: number;
    zoneCards: readonly (readonly Card[])[];
    baseCards: readonly (Card | null)[];
    candidates: Card[];
}

const attackableCandidateCaches = new WeakMap<Game, IAttackableCandidateCache>();

function getAttackableCandidates(game: Game): Card[] {
    const allCardIds = game.state.allCards;
    const zoneCards: (readonly Card[])[] = [game.groundArena.cards, game.spaceArena.cards];
    const baseCards: (Card | null)[] = [];
    for (const player of game.getPlayers()) {
        const baseZone = player.baseZone;
        zoneCards.push(baseZone.leaders, baseZone.credits, baseZone.upgrades);
        baseCards.push(baseZone.base, baseZone.forceToken);
    }
    let cached = attackableCandidateCaches.get(game);

    // Arena and base-zone membership changes replace these arrays, including during rollback.
    // allCards is replaced on rollback, but token generation appends to the existing array.
    if (!cached || cached.allCardIds !== allCardIds || cached.allCardCount !== allCardIds.length ||
      cached.zoneCards.length !== zoneCards.length || cached.baseCards.length !== baseCards.length ||
      zoneCards.some((cards, index) => cards !== cached.zoneCards[index]) ||
      baseCards.some((card, index) => card !== cached.baseCards[index])) {
        cached = {
            allCardIds,
            allCardCount: allCardIds.length,
            zoneCards,
            baseCards,
            // Keep the original registration order rather than each zone's insertion order.
            candidates: game.allCards.filter((card) => EnumHelpers.isAttackableZone(card.zoneName))
        };
        attackableCandidateCaches.set(game, cached);
    }

    // Only candidate discovery is cached. Eligibility and dynamic values are reevaluated normally.
    // Preserve the fresh array returned by getTargets so callers cannot mutate the cached list.
    return cached.candidates.slice();
}

@registerState()
export class OngoingCardEffect extends OngoingEffect<Card> {
    public readonly targetsSourceOnly: boolean;
    public readonly targetZoneFilter: ZoneFilter;
    public readonly targetCardTypeFilter: CardTypeFilter[];
    public readonly targetController: RelativePlayerFilter;
    public declare matchTarget: Card | ((target: Card, context: AbilityContext) => boolean);

    public constructor(game: Game, source: Card, properties: IOngoingCardEffectProps, effect: OngoingEffectImpl<any>) {
        super(game, source, properties, effect);

        if (!properties.matchTarget) {
            // if there are no filters provided, effect only targets the source card
            if (!properties.targetZoneFilter && !properties.targetCardTypeFilter && !properties.targetController) {
                this.targetsSourceOnly = true;
                return;
            }
        }

        this.targetsSourceOnly = false;
        this.targetController = properties.targetController || RelativePlayer.Self;
        Contract.assertFalse(typeof this.targetController === 'object', 'target controller must be a RelativePlayer enum.');

        if (!properties.targetZoneFilter) {
            this.targetZoneFilter = properties.sourceZoneFilter === WildcardZoneName.Any
                ? WildcardZoneName.Any
                : WildcardZoneName.AnyArena;
        } else {
            this.targetZoneFilter = properties.targetZoneFilter;
        }

        // TODO: rework getTargets() so that we can provide an array while still not searching all cards in the game every time
        Contract.assertFalse(Array.isArray(properties.targetZoneFilter), 'Target zone filter for an effect definition cannot be an array');

        this.targetCardTypeFilter = properties.targetCardTypeFilter ? Helpers.asArray(properties.targetCardTypeFilter) : [WildcardCardType.Unit];
    }

    /** @override */
    public override isValidTarget(target: Card) {
        if (this.targetsSourceOnly) {
            return target === this.context.source;
        }

        // Only gain effects need to scan the target's ongoing effects for blanking.
        if (this.impl.valueWrapper.isGainAbility() && target.isBlank()) {
            const gainSource = this.impl.valueWrapper.gainAbilitySource;

            if (!target.canGainAbilityFromSource(gainSource)) {
                return false;
            }
        }

        // If the target is blanked, it cannot gain keywords unless it is in an hidden zone,
        // this is to allow blanked cards to be played if they gain smuggle
        if (this.impl.type === EffectName.GainKeyword && target.isBlank() && !EnumHelpers.isHiddenFromOpponent(target.zoneName, RelativePlayer.Self)) {
            const keywords = Helpers.asArray(this.impl.getValue(target))
                .map((k) => (typeof k === 'string' ? k : k.keyword));

            if (keywords.every((k) => target.hasKeywordRemoved(k))) {
                return false;
            }
        }

        if (typeof this.matchTarget !== 'function') {
            if (target === this.matchTarget) {
                // This is a hack to check whether this is a lasting effect
                return true;
            }

            return false;
        }

        return (
            (this.targetController !== RelativePlayer.Self || target.controller === this.source.controller) &&
            (this.targetController !== RelativePlayer.Opponent || target.controller !== this.source.controller) &&
            EnumHelpers.cardZoneMatches(target.zoneName, this.targetZoneFilter) &&
            EnumHelpers.cardTypeMatches(target.type, this.targetCardTypeFilter) &&
            this.matchTarget(target, this.context)
        );
    }

    /** @override */
    public override getTargets() {
        if (this.targetsSourceOnly) {
            return [this.context.source];
        } else if (this.targetZoneFilter === WildcardZoneName.Any) {
            return this.game.allCards;
        } else if (EnumHelpers.isArena(this.targetZoneFilter)) {
            return this.game.findAnyCardsInPlay();
        } else if (this.targetZoneFilter === WildcardZoneName.AnyAttackable && typeof this.matchTarget === 'function') {
            return getAttackableCandidates(this.game);
        }
        return this.game.allCards;
    }
}
