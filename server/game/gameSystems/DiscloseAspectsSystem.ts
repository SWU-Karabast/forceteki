import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { Aspect, GameStateChangeRequired } from '../core/Constants';
import { Conjunction, EventName } from '../core/Constants';
import { RelativePlayer, TargetMode, ZoneName } from '../core/Constants';
import { RevealSystem } from './RevealSystem';
import { SelectCardSystem } from './SelectCardSystem';
import { ViewCardInteractMode } from './ViewCardSystem';
import { Helpers } from '../core/utils/Helpers';
import { Contract } from '../core/utils/Contract';
import type { GameEvent } from '../core/event/GameEvent';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import { TextHelper } from '../core/utils/TextHelper';

export enum DiscloseMode {
    Any = 'any',
    Some = 'some',
    All = 'all'
}

export interface IDiscloseAspectsProperties extends IPlayerTargetSystemProperties {
    activePromptTitle?: string;
    aspects: Aspect[];
    mode?: DiscloseMode;
}

export class DiscloseAspectsSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IDiscloseAspectsProperties> {
    public override readonly name = 'aspectsDisclosed';
    public override readonly eventName = EventName.OnAspectsDisclosed;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(): void {}

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IDiscloseAspectsProperties> = {}): void {
        const generatedEvents = [];
        for (const target of this.targets(context, additionalProperties)) {
            if (target.isPlayer() && this.canSatisfyDisclose(target, context, additionalProperties)) {
                const event = this.generateRetargetedEvent(target, context, additionalProperties);
                generatedEvents.push(event);
                events.push(event);
            }
        }

        for (const target of this.targets(context, additionalProperties)) {
            if (target.isPlayer()) {
                // Create new context with the targeted player so the RelativePlayer
                // is resolved correctly in the SelectCardSystem
                const newContext = context.copy({ player: target }) as TContext;
                if (this.canSatisfyDisclose(target, context, additionalProperties)) {
                    this.generateSelectCardSystem(newContext, additionalProperties, generatedEvents)
                        .queueGenerateEventGameSteps(events, newContext);
                } else if (this.shouldMaskDisclose(context)) {
                    // A triggered/automatic disclose can't meet the requirement. Resolving instantly would
                    // leak to the opponent that this player's hand can't satisfy the requirement, so instead
                    // queue a brief client-driven pause that is indistinguishable from a player who could
                    // disclose but declined. No disclose event is generated, so any dependent "if you do"
                    // effect correctly does not resolve.
                    newContext.game.promptForPassDelay(target, {
                        source: context.source.name,
                        activePromptTitle: 'Pausing for Disclose'
                    });
                }
                // For a player-initiated disclose the player already chose to use the ability (and was warned
                // it would have no effect), so we resolve with no effect and no masking pause.
            }
        }
    }

    public override defaultTargets(context: TContext): Player[] {
        return [context.player];
    }

    public override canAffectInternal(
        player: Player,
        context: TContext,
        additionalProperties?: Partial<IDiscloseAspectsProperties>,
        mustChangeGameState?: GameStateChangeRequired
    ): boolean {
        // For a triggered/automatic disclose we always treat disclosing as a legal action so that the
        // ability triggers even when the hand can't satisfy the requirement. This lets us show a masking
        // pause during resolution (see queueGenerateEventGameSteps) instead of silently passing, which
        // would leak hidden information to the opponent. For player-initiated abilities (actions, events)
        // the player provides their own visible interaction, so we report the true legality and preserve
        // the normal "this ability will have no effect" confirmation flow.
        if (this.shouldMaskDisclose(context)) {
            return true;
        }
        return this.canSatisfyDisclose(player, context, additionalProperties, mustChangeGameState);
    }

    // Private helpers

    /** Whether the player's hand contains cards that can be revealed to satisfy the required aspects. */
    private canSatisfyDisclose(
        player: Player,
        context: TContext,
        additionalProperties?: Partial<IDiscloseAspectsProperties>,
        mustChangeGameState?: GameStateChangeRequired
    ): boolean {
        const newContext = context.copy({ player }) as TContext;
        const selectCardSystem = this.generateSelectCardSystem(newContext, additionalProperties);
        return selectCardSystem.hasLegalTarget(newContext, null, mustChangeGameState);
    }

    /**
     * Whether a disclose that can't meet the requirement should be masked with a pause rather than
     * resolving instantly. Only triggered/automatic abilities need masking; player-initiated abilities
     * (actions, events) already involve a visible interaction, so an instant pass reveals nothing new.
     */
    private shouldMaskDisclose(context: TContext): boolean {
        return context.ability?.isTriggeredAbility() === true;
    }

    private generateSelectCardSystem(
        context: TContext,
        additionalProperties: Partial<IDiscloseAspectsProperties> = {},
        events = []
    ): SelectCardSystem<TContext> {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const mode = properties.mode ?? DiscloseMode.All;

        switch (mode) {
            case DiscloseMode.Any:
                return new SelectCardSystem<TContext>({
                    activePromptTitle: properties.activePromptTitle,
                    zoneFilter: ZoneName.Hand,
                    controller: RelativePlayer.Self,
                    mode: TargetMode.Single,
                    cardCondition: (card) => properties.aspects.some((aspect) => card.aspects.includes(aspect)),
                    immediateEffect: new RevealSystem<TContext>({
                        activePromptTitle: `Opponent discloses ${TextHelper.aspectList(properties.aspects, Conjunction.Or)}`,
                        promptedPlayer: RelativePlayer.Opponent,
                        useDisplayPrompt: true,
                        interactMode: ViewCardInteractMode.ViewOnly
                    }),
                    cancelHandler: events ? () => events.forEach((event) => event.cancel()) : null,
                    showCancelButton: false,
                    onSelectHandler: (cards) => this.updateEventsWithSelectedCards(events, cards),
                    cancelIfNoTargets: true,
                });
            case DiscloseMode.Some:
                return new SelectCardSystem<TContext>({
                    activePromptTitle: properties.activePromptTitle,
                    zoneFilter: ZoneName.Hand,
                    controller: RelativePlayer.Self,
                    mode: TargetMode.BetweenVariable,
                    minNumCardsFunc: (_context) => 1,
                    maxNumCardsFunc: (_context, selectedCards) => this.numberOfCardsToSelect(properties.aspects, selectedCards),
                    cardCondition: (card) => properties.aspects.some((aspect) => card.aspects.includes(aspect)),
                    multiSelectCardCondition: (card, selectedCards, context) =>
                        this.handCanSatisfyAspects(context.player.hand, properties.aspects, mode) &&
                        this.cardContainsMissingAspects(card, selectedCards, properties.aspects),
                    immediateEffect: new RevealSystem<TContext>({
                        activePromptTitle: `Opponent discloses ${TextHelper.aspectList(properties.aspects, Conjunction.AndOr)}`,
                        promptedPlayer: RelativePlayer.Opponent,
                        useDisplayPrompt: true,
                        interactMode: ViewCardInteractMode.ViewOnly
                    }),
                    cancelHandler: events ? () => events.forEach((event) => event.cancel()) : null,
                    showCancelButton: false,
                    onSelectHandler: (cards) => this.updateEventsWithSelectedCards(events, cards),
                    cancelIfNoTargets: true,
                });
            case DiscloseMode.All:
                return new SelectCardSystem<TContext>({
                    activePromptTitle: properties.activePromptTitle,
                    zoneFilter: ZoneName.Hand,
                    controller: RelativePlayer.Self,
                    mode: TargetMode.ExactlyVariable,
                    numCardsFunc: (_context, selectedCards) => this.numberOfCardsToSelect(properties.aspects, selectedCards),
                    cardCondition: (card) => properties.aspects.some((aspect) => card.aspects.includes(aspect)),
                    multiSelectCardCondition: (card, selectedCards, context) =>
                        this.handCanSatisfyAspects(context.player.hand, properties.aspects, mode) &&
                        this.cardContainsMissingAspects(card, selectedCards, properties.aspects),
                    immediateEffect: new RevealSystem<TContext>({
                        activePromptTitle: `Opponent discloses ${TextHelper.aspectList(properties.aspects)}`,
                        promptedPlayer: RelativePlayer.Opponent,
                        useDisplayPrompt: true,
                        interactMode: ViewCardInteractMode.ViewOnly
                    }),
                    cancelHandler: events ? () => events.forEach((event) => event.cancel()) : null,
                    showCancelButton: false,
                    onSelectHandler: (cards) => this.updateEventsWithSelectedCards(events, cards),
                    cancelIfNoTargets: true,
                });
            default:
                Contract.fail(`Unrecognized disclose mode: ${mode}`);
        }
    }

    private updateEventsWithSelectedCards(events: any[], selectedCards: Card | Card[]) {
        for (const event of events) {
            event.disclosedCards = Helpers.asArray(selectedCards);
        }
    }

    private handCanSatisfyAspects(hand: Card[], requiredAspects: Aspect[], mode: DiscloseMode): boolean {
        if (mode === DiscloseMode.Some) {
            return hand.some((card) => requiredAspects.some((aspect) => card.aspects.includes(aspect)));
        }

        return this.aspectsMissing(requiredAspects, hand).length === 0;
    }

    private numberOfCardsToSelect(requiredAspects: Aspect[], selectedCards?: Card[]): number {
        if (!selectedCards || selectedCards.length === 0) {
            // Start with arbitrary non-zero number to enable selection
            return 1;
        } else if (this.aspectsMissing(requiredAspects, selectedCards).length === 0) {
            return selectedCards.length;
        }

        return selectedCards.length + 1;
    }

    private cardContainsMissingAspects(card: Card, selectedCards: Card[], requiredAspects: Aspect[]): boolean {
        const missingAspects = this.aspectsMissing(requiredAspects, selectedCards);
        return card.aspects.some((aspect) => missingAspects.includes(aspect));
    }

    private aspectsMissing(requiredAspects: Aspect[], cards: Card[]): Aspect[] {
        const requiredCounts = Helpers.countOccurrences(requiredAspects);
        const representedCounts = Helpers.countOccurrences(cards.flatMap((card) => card.aspects));

        return Array.from(requiredCounts.entries())
            .filter(([aspect, requiredCount]) => (representedCounts.get(aspect) || 0) < requiredCount)
            .map(([aspect]) => aspect);
    }
}
