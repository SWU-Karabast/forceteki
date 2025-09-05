import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { Card } from '../../../core/card/Card';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, RelativePlayer, TargetMode, ZoneName } from '../../../core/Constants';
import * as Helpers from '../../../core/utils/Helpers';

export default class MinaBonteriStopThisWar extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9378249305',
            internalName: 'mina-bonteri#stop-this-war',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        const aspects: Aspect[] = [Aspect.Command, Aspect.Command, Aspect.Heroism];
        registrar.addWhenDefeatedAbility({
            title: `Disclose ${this.aspectString(aspects)}`,
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                mode: TargetMode.ExactlyVariable,
                numCardsFunc: (_context, selectedCards) => this.numberOfCardsToSelect(selectedCards, aspects),
                cardCondition: (card) => aspects.some((aspect) => card.aspects.includes(aspect)),
                multiSelectCardCondition: (card, selectedCards) => this.cardContainsMissingAspects(card, selectedCards, aspects),
                immediateEffect: AbilityHelper.immediateEffects.reveal({
                    activePromptTitle: `Opponent discloses ${this.aspectString(aspects)}`,
                    promptedPlayer: RelativePlayer.Opponent,
                    useDisplayPrompt: true
                })
            },
            ifYouDo: {
                title: 'Draw a card',
                immediateEffect: AbilityHelper.immediateEffects.draw({ amount: 1 })
            }
        });
    }

    private numberOfCardsToSelect(selectedCards: Card[], requiredAspects: Aspect[]): number {
        if (selectedCards.length === 0) {
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

    private aspectsMissing(requiredAspects: Aspect[], selectedCards: Card[]): Aspect[] {
        const requiredCounts = Helpers.countOccurrences(requiredAspects);
        const representedCounts = Helpers.countOccurrences(selectedCards.flatMap((card) => card.aspects));

        return Array.from(requiredCounts.entries())
            .filter(([aspect, requiredCount]) => (representedCounts.get(aspect) || 0) < requiredCount)
            .map(([aspect]) => aspect);
    }

    private aspectString(aspects: Aspect[]): string {
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