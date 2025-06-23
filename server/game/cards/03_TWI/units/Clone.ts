import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Duration, Trait, WildcardCardType } from '../../../core/Constants';

export default class Clone extends NonLeaderUnitCard {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    protected override get overrideNotImplemented(): boolean {
        return true;
    }

    protected override getImplementationId() {
        return {
            id: '0345124206',
            internalName: 'clone',
        };
    }

    protected override setupCardAbilities(): void {
        this.addPreEnterPlayAbility({
            title: 'This unit enters play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card, context) => !card.hasSomeTrait(Trait.Vehicle) && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.cardLastingEffect((context) => ({
                    duration: Duration.Custom,
                    until: {
                        onCardLeavesPlay: (event, context) => event.card === context.source,
                    },
                    target: context.source,
                    effect: [
                        AbilityHelper.ongoingEffects.overridePrintedAttributes({
                            title: context.target.title,
                            subtitle: context.target.subtitle,
                            aspects: context.target.aspects,
                            defaultArena: context.target.defaultArena,
                            printedType: context.target.printedType,
                            printedCost: context.target.printedCost,
                            printedHp: context.target.getPrintedHp(),
                            printedPower: context.target.getPrintedPower(),
                            printedTraits: context.target.getPrintedTraits(),
                        }),
                        AbilityHelper.ongoingEffects.gainTrait(Trait.Clone),
                        AbilityHelper.ongoingEffects.isClonedUnit(),
                    ]
                })),
            },
        });
    }
}