import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { Aspect, RelativePlayer, TargetMode, ZoneName } from '../core/Constants';
import { RevealSystem } from './RevealSystem';
import type { ISelectCardProperties } from './SelectCardSystem';
import { ViewCardInteractMode } from './ViewCardSystem';
import * as Helpers from '../core/utils/Helpers';

type PropsFactory<Props, TContext extends AbilityContext = AbilityContext> = Props | ((context: TContext) => Props);

export namespace DiscloseAspectsSystem {
    export function buildSelectCardProps<TContext extends AbilityContext = AbilityContext>(
        propertyFactory: PropsFactory<Aspect[], TContext>
    ): PropsFactory<ISelectCardProperties<TContext>, TContext> {
        const makeProps = (aspects: Aspect[]) => ({
            activePromptTitle: `Disclose ${aspectString(aspects)}`,
            zoneFilter: ZoneName.Hand,
            controller: RelativePlayer.Self,
            mode: TargetMode.ExactlyVariable as (TargetMode.ExactlyVariable | TargetMode.UpToVariable),
            numCardsFunc: (_context, selectedCards) => numberOfCardsToSelect(selectedCards, aspects),
            cardCondition: (card) => aspects.some((aspect) => card.aspects.includes(aspect)),
            multiSelectCardCondition: (card, selectedCards, context) =>
                handCanSatisfyAspects(context.player.hand, aspects) &&
                cardContainsMissingAspects(card, selectedCards, aspects),
            immediateEffect: new RevealSystem<TContext>({
                activePromptTitle: `Opponent discloses ${aspectString(aspects)}`,
                promptedPlayer: RelativePlayer.Opponent,
                useDisplayPrompt: true,
                interactMode: ViewCardInteractMode.ViewOnly
            })
        });

        return typeof propertyFactory !== 'function'
            ? makeProps(propertyFactory)
            : (context: TContext) => makeProps(propertyFactory(context));
    }

    function handCanSatisfyAspects(hand: Card[], requiredAspects: Aspect[]): boolean {
        return aspectsMissing(requiredAspects, hand).length === 0;
    }

    function numberOfCardsToSelect(selectedCards: Card[], requiredAspects: Aspect[]): number {
        if (selectedCards.length === 0) {
            // Start with arbitrary non-zero number to enable selection
            return 1;
        } else if (aspectsMissing(requiredAspects, selectedCards).length === 0) {
            return selectedCards.length;
        }

        return selectedCards.length + 1;
    }

    function cardContainsMissingAspects(card: Card, selectedCards: Card[], requiredAspects: Aspect[]): boolean {
        const missingAspects = aspectsMissing(requiredAspects, selectedCards);
        return card.aspects.some((aspect) => missingAspects.includes(aspect));
    }

    function aspectsMissing(requiredAspects: Aspect[], cards: Card[]): Aspect[] {
        const requiredCounts = Helpers.countOccurrences(requiredAspects);
        const representedCounts = Helpers.countOccurrences(cards.flatMap((card) => card.aspects));

        return Array.from(requiredCounts.entries())
            .filter(([aspect, requiredCount]) => (representedCounts.get(aspect) || 0) < requiredCount)
            .map(([aspect]) => aspect);
    }

    function aspectString(aspects: Aspect[]): string {
        return aspects
            .map((aspect) => {
                switch (aspect) {
                    case Aspect.Aggression:
                        return 'Aggression';
                    case Aspect.Command:
                        return 'Command';
                    case Aspect.Cunning:
                        return 'Cunning';
                    case Aspect.Heroism:
                        return 'Heroism';
                    case Aspect.Vigilance:
                        return 'Vigilance';
                    case Aspect.Villainy:
                        return 'Villainy';
                    default:
                        return 'Unknown';
                }
            })
            .join(', ');
    }
}