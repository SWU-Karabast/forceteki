import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { Aspect, GameStateChangeRequired } from '../core/Constants';
import { EventName } from '../core/Constants';
import { RelativePlayer, TargetMode, ZoneName } from '../core/Constants';
import { RevealSystem } from './RevealSystem';
import { SelectCardSystem } from './SelectCardSystem';
import { ViewCardInteractMode } from './ViewCardSystem';
import * as Helpers from '../core/utils/Helpers';
import type { GameEvent } from '../core/event/GameEvent';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';

export interface IDiscloseAspectsProperties extends IPlayerTargetSystemProperties {
    aspects: Aspect[];
}

export class DiscloseAspectsSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, IDiscloseAspectsProperties> {
    public override readonly name = 'aspectsDisclosed';
    public override readonly eventName = EventName.OnAspectsDisclosed;

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(): void {}

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IDiscloseAspectsProperties> = {}): void {
        const generatedEvents = [];
        for (const target of this.targets(context, additionalProperties)) {
            if (this.canAffect(target, context, additionalProperties)) {
                const event = this.generateRetargetedEvent(target, context, additionalProperties);
                generatedEvents.push(event);
                events.push(event);
            }
        }

        this.generateSelectCardSystem(context, additionalProperties, generatedEvents)
            .queueGenerateEventGameSteps(events, context);
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
        const newContext = context.copy({ player }) as TContext;
        const selectCardSystem = this.generateSelectCardSystem(newContext, additionalProperties);
        return selectCardSystem.hasLegalTarget(newContext, null, mustChangeGameState);
    }

    protected override addPropertiesToEvent(event: any, player: Player, context: TContext, additionalProperties?: Partial<IDiscloseAspectsProperties>): void {
        super.addPropertiesToEvent(event, player, context, additionalProperties);

        const { aspects } = this.generatePropertiesFromContext(context, additionalProperties);

        event.aspectsDisclosed = aspects;
    }

    // Private helpers

    private generateSelectCardSystem(context: TContext, additionalProperties: Partial<IDiscloseAspectsProperties> = {}, cancelEvents = []) {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        return new SelectCardSystem<TContext>({
            zoneFilter: ZoneName.Hand,
            controller: RelativePlayer.Self,
            mode: TargetMode.ExactlyVariable,
            numCardsFunc: (_context, selectedCards) => this.numberOfCardsToSelect(selectedCards, properties.aspects),
            cardCondition: (card) => properties.aspects.some((aspect) => card.aspects.includes(aspect)),
            multiSelectCardCondition: (card, selectedCards, context) =>
                this.handCanSatisfyAspects(context.player.hand, properties.aspects) &&
                this.cardContainsMissingAspects(card, selectedCards, properties.aspects),
            immediateEffect: new RevealSystem<TContext>({
                activePromptTitle: `Opponent discloses ${Helpers.aspectString(properties.aspects)}`,
                promptedPlayer: RelativePlayer.Opponent,
                useDisplayPrompt: true,
                interactMode: ViewCardInteractMode.ViewOnly
            }),
            cancelHandler: cancelEvents ? () => cancelEvents.forEach((event) => event.cancel()) : null,
            cancelIfNoTargets: true,
        });
    }

    private handCanSatisfyAspects(hand: Card[], requiredAspects: Aspect[]): boolean {
        return this.aspectsMissing(requiredAspects, hand).length === 0;
    }

    private numberOfCardsToSelect(selectedCards: Card[], requiredAspects: Aspect[]): number {
        if (selectedCards.length === 0) {
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
