import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class HanSoloItllWork extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'han-solo#itll-work-id',
            internalName: 'han-solo#itll-work',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 3 damage to this unit. Give 3 Advantage tokens to a unit',
            immediateEffect: abilityHelper.immediateEffects.simultaneous([
                abilityHelper.immediateEffects.damage((context) => ({ amount: 3, target: context.source })),
                abilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Give 3 Advantage tokens to a unit',
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.simultaneous([
                        abilityHelper.immediateEffects.giveAdvantage({ amount: 3 })
                    ])
                })
            ])
        });
    }
}