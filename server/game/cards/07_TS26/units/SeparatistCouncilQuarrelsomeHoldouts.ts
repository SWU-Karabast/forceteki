import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SeparatistCouncilQuarrelsomeHoldouts extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7677772050',
            internalName: 'separatist-council#quarrelsome-holdouts',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Choose one option',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            immediateEffect: abilityHelper.immediateEffects.chooseModalEffects(() => ({
                amountOfChoices: 1,
                choices: () => ({
                    ['Create a Battle Droid token']: abilityHelper.immediateEffects.createBattleDroid(),
                    ['Give 2 Experience tokens to a Battle Droid tokens']: abilityHelper.immediateEffects.selectCard({
                        cardCondition: (card) => card.isTokenUnit() && card.title === 'Battle Droid',
                        immediateEffect: abilityHelper.immediateEffects.giveExperience({ amount: 2 })
                    })
                })
            })),
        });
    }
}