import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { Aspect, GameStateChangeRequired } from '../core/Constants';
import { EventName } from '../core/Constants';
import { RelativePlayer, TargetMode, ZoneName } from '../core/Constants';
import { RevealSystem } from './RevealSystem';
import { SelectCardSystem, type ISelectCardProperties } from './SelectCardSystem';
import { ViewCardInteractMode } from './ViewCardSystem';
import * as Helpers from '../core/utils/Helpers';
import type { GameEvent } from '../core/event/GameEvent';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';

type PropsFactory<Props, TContext extends AbilityContext = AbilityContext> = Props | ((context: TContext) => Props);

export interface IDiscloseAspectsProperties extends ICardTargetSystemProperties {
    aspects: Aspect[];
}

export class DiscloseAspectsSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDiscloseAspectsProperties> {
    public override readonly name = 'aspectsDisclosed';
    public override readonly eventName = EventName.OnAspectsDisclosed;

    private selectCardSystem: SelectCardSystem<TContext>;

    public constructor(propertiesOrPropertyFactory: PropsFactory<IDiscloseAspectsProperties, TContext>) {
        super(propertiesOrPropertyFactory);
        this.selectCardSystem = new SelectCardSystem<TContext>(DiscloseAspectsSystem.buildSelectCardProps(propertiesOrPropertyFactory));
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(): void {}

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IDiscloseAspectsProperties> = {}): void {
        super.queueGenerateEventGameSteps(events, context, additionalProperties);

        this.selectCardSystem.queueGenerateEventGameSteps(events, context);
    }

    public override hasLegalTarget(context: TContext, additionalProperties?: Partial<IDiscloseAspectsProperties>, mustChangeGameState?: GameStateChangeRequired): boolean {
        return this.selectCardSystem.hasLegalTarget(context, null, mustChangeGameState);
    }

    public override canAffectInternal(card: Card, context: TContext, additionalProperties?: Partial<IDiscloseAspectsProperties>, mustChangeGameState?: GameStateChangeRequired): boolean {
        return this.selectCardSystem.canAffectInternal(card, context, null, mustChangeGameState);
    }

    protected override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: Partial<IDiscloseAspectsProperties>): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        const { aspects } = this.generatePropertiesFromContext(context, additionalProperties);

        event.aspectsDisclosed = aspects;
    }

    // Private helpers

    private static buildSelectCardProps<TContext extends AbilityContext = AbilityContext>(
        propertyFactory: PropsFactory<IDiscloseAspectsProperties, TContext>
    ): PropsFactory<ISelectCardProperties<TContext>, TContext> {
        const makeProps = (properties: IDiscloseAspectsProperties) => ({
            zoneFilter: ZoneName.Hand,
            controller: RelativePlayer.Self,
            mode: TargetMode.ExactlyVariable as (TargetMode.ExactlyVariable | TargetMode.UpToVariable),
            numCardsFunc: (_context, selectedCards) => DiscloseAspectsSystem.numberOfCardsToSelect(selectedCards, properties.aspects),
            cardCondition: (card) => properties.aspects.some((aspect) => card.aspects.includes(aspect)),
            multiSelectCardCondition: (card, selectedCards, context) =>
                DiscloseAspectsSystem.handCanSatisfyAspects(context.player.hand, properties.aspects) &&
                DiscloseAspectsSystem.cardContainsMissingAspects(card, selectedCards, properties.aspects),
            immediateEffect: new RevealSystem<TContext>({
                activePromptTitle: `Opponent discloses ${Helpers.aspectString(properties.aspects)}`,
                promptedPlayer: RelativePlayer.Opponent,
                useDisplayPrompt: true,
                interactMode: ViewCardInteractMode.ViewOnly
            })
        });

        return typeof propertyFactory !== 'function'
            ? makeProps(propertyFactory)
            : (context: TContext) => makeProps(propertyFactory(context));
    }

    private static handCanSatisfyAspects(hand: Card[], requiredAspects: Aspect[]): boolean {
        return DiscloseAspectsSystem.aspectsMissing(requiredAspects, hand).length === 0;
    }

    private static numberOfCardsToSelect(selectedCards: Card[], requiredAspects: Aspect[]): number {
        if (selectedCards.length === 0) {
            // Start with arbitrary non-zero number to enable selection
            return 1;
        } else if (DiscloseAspectsSystem.aspectsMissing(requiredAspects, selectedCards).length === 0) {
            return selectedCards.length;
        }

        return selectedCards.length + 1;
    }

    private static cardContainsMissingAspects(card: Card, selectedCards: Card[], requiredAspects: Aspect[]): boolean {
        const missingAspects = DiscloseAspectsSystem.aspectsMissing(requiredAspects, selectedCards);
        return card.aspects.some((aspect) => missingAspects.includes(aspect));
    }

    private static aspectsMissing(requiredAspects: Aspect[], cards: Card[]): Aspect[] {
        const requiredCounts = Helpers.countOccurrences(requiredAspects);
        const representedCounts = Helpers.countOccurrences(cards.flatMap((card) => card.aspects));

        return Array.from(requiredCounts.entries())
            .filter(([aspect, requiredCount]) => (representedCounts.get(aspect) || 0) < requiredCount)
            .map(([aspect]) => aspect);
    }
}
