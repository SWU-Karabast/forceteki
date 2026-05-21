import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class GrandMoffTarkinTakingKrennicsAchievement extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4893108887',
            internalName: 'grand-moff-tarkin#taking-krennics-achievement',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Take control of an enemy non-leader Vehicle unit. When this unit leaves play, that unit\'s owner takes control of that unit',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Vehicle),
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                        newController: context.player,
                    })),
                    abilityHelper.immediateEffects.delayedCardEffect((context) => ({
                        title: 'Unit\'s owner takes control of that unit',
                        when: {
                            onCardLeavesPlay: (event) => event.card === context.source
                        },
                        effectDescription: 'apply an effect that will give control to its owner when this unit leaves play',
                        immediateEffect: abilityHelper.immediateEffects.takeControlOfUnit({
                            newController: context.target.owner,
                            excludeLeaderUnit: false,
                        }),
                    }))
                ])
            }
        });
    }
}
