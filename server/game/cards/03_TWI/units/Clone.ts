import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Duration, KeywordName, Trait, WildcardCardType } from '../../../core/Constants';

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

    protected override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar): void {
        registrar.addPreEnterPlayAbility({
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
                            printedKeywords: context.target.printedKeywords
                                // TODO: Manually exclude Bounty and Coordinate keywords until support for card abilities is added
                                .filter((keyword) => !(
                                    keyword.name === KeywordName.Bounty &&
                                    keyword.name === KeywordName.Coordinate
                                ))
                                .map((keyword) => keyword.duplicate(context.source)),
                        }),
                        AbilityHelper.ongoingEffects.gainTrait(Trait.Clone),
                        AbilityHelper.ongoingEffects.isClonedUnit(),
                    ]
                })),
            },
        });
    }
}