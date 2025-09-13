import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';
import * as Helpers from '../../../core/utils/Helpers';

export default class AhsokaTanoILearnedItFromYou extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7352167785',
            internalName: 'ahsoka-tano#i-learned-it-from-you',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Command, Aspect.Heroism];
        registrar.addTriggeredAbility({
            title: `Disclose ${Helpers.aspectString(aspects)} to attack with another unit`,
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source,
            },
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Attack with another unit',
                initiateAttack: {
                    attackerCondition: (card, context) => card !== context.source
                }
            }
        });
    }
}
