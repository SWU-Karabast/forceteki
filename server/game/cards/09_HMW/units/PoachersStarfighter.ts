import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class PoachersStarfighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5492335894',
            internalName: 'poachers-starfighter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat this unit. If you do, create a Beast token and deal 1 damage to it',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.defeat((context) => ({ target: context.source })),
            ifYouDo: ({
                title: 'Create a Beast token and deal 1 damage to it.',
                immediateEffect: AbilityHelper.immediateEffects.createBeast((context) => ({
                    amount: 1,
                    target: context.player,
                    enterPlayEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                })),
            })
        });
    }
}