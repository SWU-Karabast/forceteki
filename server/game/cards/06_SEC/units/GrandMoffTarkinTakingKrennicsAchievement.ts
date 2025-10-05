import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class GrandMoffTarkinTakingKrennicsAchievement extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'grand-moff-tarkin#taking-krennics-achievement-id',
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
                    abilityHelper.immediateEffects.delayedPlayerEffect((context) => ({
                        title: 'Unit\'s owner takes control of that unit',
                        target: context.source,
                        when: {
                            onCardLeavesPlay: (event) => event.card === context.source
                        },
                        immediateEffect: abilityHelper.immediateEffects.takeControlOfUnit({
                            newController: context.target.owner,
                            target: context.target
                        }),
                    }))
                ])
            }
        });
    }
}
