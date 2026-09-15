import type { AbilityContext } from '../core/ability/AbilityContext';
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

/**
 * The subset of {@link ISelectCardProperties} forwarded to the {@link SelectCardSystem} used to choose each card. These
 * describe the eligible cards and the selection prompt, and are kept in sync with the selection layer rather than
 * redeclared (mirroring {@link ForwardedPlayCardProperties}).
 */
type ForwardedSelectionProperties<TContext extends AbilityContext> = Pick<ISelectCardProperties<TContext>, 'activePromptTitle' | 'cardCondition' | 'cardTypeFilter'>;

export interface IPlayMultipleCardsFromHandProperties<TContext extends AbilityContext = AbilityContext>
    extends IGameSystemProperties, ForwardedPlayCardProperties, ForwardedSelectionProperties<TContext> {

    /**
     * The maximum number of cards that may be played. If omitted, there is no limit and the player may keep
     * playing eligible cards until they decline (e.g. "play any number of...").
     */
    maxCards?: number;
}

/**
 * Plays multiple cards from the player's hand one at a time, fully resolving each card (including any triggered
 * abilities) before the player selects the next card to play. This is important because playing a card can change
 * the contents of the hand and the game state (e.g. a played unit's "When Played" ability draws or discards a card),
 * and the player should be able to choose the next card to play based on the updated game state.
 *
 * Used by cards such as General Grievous - Separatist Warlord ("Play 2 units from your hand, one at a time, paying
 * their costs").
 */
export class PlayMultipleCardsFromHandSystem<TContext extends AbilityContext = AbilityContext> extends GameSystem<TContext, IPlayMultipleCardsFromHandProperties<TContext>> {
    public override readonly name = 'playMultipleCardsFromHand';
    public override readonly eventName = MetaEventName.PlayMultipleCardsFromHand;
    public override readonly effectDescription = 'play multiple cards from their hand';

    protected override readonly defaultProperties: Partial<IPlayMultipleCardsFromHandProperties<TContext>> = {
        optional: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(): void { }

    protected override isTargetTypeValid(): boolean {
        return false;
    }

    public override getEffectMessage(context: TContext, additionalProperties: Partial<IPlayMultipleCardsFromHandProperties<TContext>> = {}): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return [this.effectDescription, [properties.maxCards]];
    }

    public override hasLegalTarget(context: TContext, additionalProperties: Partial<IPlayMultipleCardsFromHandProperties<TContext>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (properties.maxCards != null && properties.maxCards <= 0) {
            return false;
        }
        return this.buildSelectCardSystem(context, properties, `${this.name}-probe`).hasLegalTarget(context, {}, mustChangeGameState);
    }

    public override canAffect(target: GameObject | GameObject[], context: TContext, additionalProperties: Partial<IPlayMultipleCardsFromHandProperties<TContext>> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        return this.hasLegalTarget(context, additionalProperties, mustChangeGameState);
    }

    public override hasTargetsChosenByPlayer(context: TContext, player: Player = context.player, additionalProperties: Partial<IPlayMultipleCardsFromHandProperties<TContext>> = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return this.buildSelectCardSystem(context, properties, `${this.name}-probe`).hasTargetsChosenByPlayer(context, player);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IPlayMultipleCardsFromHandProperties<TContext>> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const maxCards = properties.maxCards ?? Number.POSITIVE_INFINITY;

        this.queuePlayCardStep(context, properties, 0, maxCards);
    }

    /**
     * Queues a single "select a card and play it" step. Once the selected card (and any resulting triggered
     * abilities) has fully resolved, this recursively queues the next selection step, allowing the player to react
     * to any changes to their hand before choosing the next card.
     *
     * Each selection resolves in its own event window (via `resolve`) rather than pushing into the parent ability's
     * `events` array. This is essential: it guarantees the previously-selected card is fully played and its triggers
     * resolved before the next selection prompt is shown, so the player sees the up-to-date game state.
     */
    private queuePlayCardStep(context: TContext, properties: IPlayMultipleCardsFromHandProperties<TContext>, cardsPlayed: number, maxCards: number): void {
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
            }, 'check for another card to play from hand');
        }, 'select and play a card from hand');
    }

    private buildSelectCardSystem(
        context: TContext,
        properties: IPlayMultipleCardsFromHandProperties<TContext>,
        selectName: string
    ): SelectCardSystem<TContext> {
        const selectProperties: ISelectCardProperties<TContext> = {
            activePromptTitle: properties.activePromptTitle,
            mode: TargetMode.Single,
            optional: true,
            zoneFilter: ZoneName.Hand,
            controller: RelativePlayer.Self,
            cardTypeFilter: properties.cardTypeFilter,
            cardCondition: properties.cardCondition,
            name: selectName,
            immediateEffect: new PlayCardSystem<TContext>({
                playType: PlayType.PlayFromHand,
                nested: true,
                playAsType: properties.playAsType,
                adjustCost: properties.adjustCost,
                // The play action invokes attachTargetCondition with the played card's own context (where `source` is
                // the card being played). Card authors expect `context` to refer to this system's ability context (so
                // that e.g. `context.source` resolves to the ability's source), so we bind it here.
                attachTargetCondition: properties.attachTargetCondition
                    ? (attachTarget) => properties.attachTargetCondition(attachTarget, context)
                    : undefined,
            }),
        };

        return new SelectCardSystem<TContext>(selectProperties);
    }
}
