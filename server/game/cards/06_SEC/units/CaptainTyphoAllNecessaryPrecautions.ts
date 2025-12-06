import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class CaptainTyphoAllNecessaryPrecautions extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8088607505',
            internalName: 'captain-typho#all-necessary-precautions',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Command, Aspect.Heroism];

        registrar.addTriggeredAbility({
            title: `Disclose ${EnumHelpers.aspectString(aspects)} to heal 1 damage from your base`,
            when: {
                onAttackDeclared: (event, context) => event.attack.getAllTargets().includes(context.source),
            },
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Heal 1 damage from your base',
                immediateEffect: abilityHelper.immediateEffects.heal((context) => ({
                    amount: 1,
                    target: context.player.base
                }))
            },
        });
    }
}
