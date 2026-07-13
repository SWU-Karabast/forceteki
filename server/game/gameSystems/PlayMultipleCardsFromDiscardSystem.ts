import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { CardTypeFilter } from '../core/Constants';
import { GameStateChangeRequired, MetaEventName, PlayType, RelativePlayer, TargetMode, ZoneName } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { IGameSystemProperties } from '../core/gameSystem/GameSystem';
import { GameSystem } from '../core/gameSystem/GameSystem';
import type { GameObject } from '../core/GameObject';
import type { Player } from '../core/Player';
import { Helpers } from '../core/utils/Helpers';
import type { IPlayCardProperties } from './PlayCardSystem';
import { PlayCardSystem } from './PlayCardSystem';
import type { ISelectCardProperties } from './SelectCardSystem';
import { SelectCardSystem } from './SelectCardSystem';

/**
 * The subset of {@link IPlayCardProperties} forwarded to the {@link PlayCardSystem} that plays each individual card.
 * `playType` and `nested` are always set by this system, so they're intentionally not included here.
 * - `playAsType`: the type each card is played as (unit, upgrade, etc.)
 * - `adjustCost`: cost adjustment applied to each card (e.g. play for free); omit to pay the printed cost
 * - `attachTargetCondition`: restricts the unit a played upgrade / pilot may attach to (e.g. "on this unit")
 */
type ForwardedPlayCardProperties = Pick<IPlayCardProperties, 'playAsType' | 'adjustCost' | 'attachTargetCondition'>;

export interface IPlayMultipleCardsFromDiscardProperties<TContext extends AbilityContext = AbilityContext> extends IGameSystemProperties, ForwardedPlayCardProperties {

    /**
     * The maximum number of cards that may be played. If omitted, there is no limit and the player may keep
     * playing eligible cards until they decline (e.g. "play any number of...").
     */
    maxCards?: number;

    /** Prompt shown each time the player selects a card to play. */
    activePromptTitle?: string;

    /** Filters the cards in the discard pile that are eligible to be played. */
    cardCondition?: (card: Card, context: TContext) => boolean;
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
}

/**
 * Plays multiple cards from the discard pile one at a time, fully resolving each card (including any triggered
 * abilities) before the player selects the next card to play. This is important because playing a card can change
 * the contents of the discard pile (e.g. a played unit defeats a unit in play, sending it to the discard), and the
 * player should be able to choose the next card to play based on the updated game state.
 *
 * Used by cards such as Dathomiri Magicks ("Play up to 3 non-Vehicle units...") and Kylo Ren - We're Not Done Yet
 * ("Play any number of Upgrades from your discard pile on this unit").
 */
export class PlayMultipleCardsFromDiscardSystem<TContext extends AbilityContext = AbilityContext> extends GameSystem<TContext, IPlayMultipleCardsFromDiscardProperties<TContext>> {
    public override readonly name = 'playMultipleCardsFromDiscard';
    public override readonly eventName = MetaEventName.PlayMultipleCardsFromDiscard;
    public override readonly effectDescription = 'play multiple cards from the discard pile';

    protected override readonly defaultProperties: Partial<IPlayMultipleCardsFromDiscardProperties<TContext>> = {
        optional: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(): void { }

    protected override isTargetTypeValid(): boolean {
        return false;
    }

    public override getEffectMessage(context: TContext, additionalProperties: Partial<IPlayMultipleCardsFromDiscardProperties<TContext>> = {}): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return [this.effectDescription, [properties.maxCards]];
    }

    public override hasLegalTarget(context: TContext, additionalProperties: Partial<IPlayMultipleCardsFromDiscardProperties<TContext>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (properties.maxCards != null && properties.maxCards <= 0) {
            return false;
        }
        return this.buildSelectCardSystem(context, properties, `${this.name}-probe`).hasLegalTarget(context, {}, mustChangeGameState);
    }

    public override canAffect(target: GameObject | GameObject[], context: TContext, additionalProperties: Partial<IPlayMultipleCardsFromDiscardProperties<TContext>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        return this.hasLegalTarget(context, additionalProperties, mustChangeGameState);
    }

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<IPlayMultipleCardsFromDiscardProperties<TContext>> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return this.buildSelectCardSystem(context, properties, `${this.name}-probe`).hasTargetsChosenByPlayer(context, player);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IPlayMultipleCardsFromDiscardProperties<TContext>> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const maxCards = properties.maxCards ?? Number.POSITIVE_INFINITY;

        this.queuePlayCardStep(context, properties, 0, maxCards);
    }

    /**
     * Queues a single "select a card and play it" step. Once the selected card (and any resulting triggered
     * abilities) has fully resolved, this recursively queues the next selection step, allowing the player to react
     * to any changes to the discard pile before choosing the next card.
     *
     * Each selection resolves in its own event window (via `resolve`) rather than pushing into the parent ability's
     * `events` array. This is essential: it guarantees the previously-selected card is fully played and its triggers
     * resolved before the next selection prompt is shown, so the player sees the up-to-date discard pile.
     */
    private queuePlayCardStep(context: TContext, properties: IPlayMultipleCardsFromDiscardProperties<TContext>, cardsPlayed: number, maxCards: number): void {
        context.game.queueSimpleStep(() => {
            if (cardsPlayed >= maxCards) {
                return;
            }

            const selectName = `${this.name}-${cardsPlayed}`;
            const selectCardSystem = this.buildSelectCardSystem(context, properties, selectName);

            if (!selectCardSystem.hasLegalTarget(context)) {
                return;
            }

            selectCardSystem.resolve(undefined, context);

            context.game.queueSimpleStep(() => {
                // if the player selected (and played) a card, offer to play another one
                if (Helpers.asArray(context.targets[selectName]).length > 0) {
                    this.queuePlayCardStep(context, properties, cardsPlayed + 1, maxCards);
                }
            }, 'check for another card to play from the discard pile');
        }, 'select and play a card from the discard pile');
    }

    private buildSelectCardSystem(
        context: TContext,
        properties: IPlayMultipleCardsFromDiscardProperties<TContext>,
        selectName: string
    ): SelectCardSystem<TContext> {
        const selectProperties: ISelectCardProperties<TContext> = {
            activePromptTitle: properties.activePromptTitle,
            mode: TargetMode.Single,
            optional: true,
            zoneFilter: ZoneName.Discard,
            controller: RelativePlayer.Self,
            cardTypeFilter: properties.cardTypeFilter,
            cardCondition: properties.cardCondition,
            name: selectName,
            immediateEffect: new PlayCardSystem<TContext>({
                playType: PlayType.PlayFromOutOfPlay,
                nested: true,
                playAsType: properties.playAsType,
                adjustCost: properties.adjustCost,
                // The play action invokes attachTargetCondition with the played card's own context (where `source` is
                // the card being played). Card authors expect `context` to refer to this system's ability context (so
                // that e.g. `context.source` resolves to the ability's source, as with Kylo Ren), so we bind it here.
                attachTargetCondition: properties.attachTargetCondition
                    ? (attachTarget) => properties.attachTargetCondition(attachTarget, context)
                    : undefined,
            }),
        };

        return new SelectCardSystem<TContext>(selectProperties);
    }
}
