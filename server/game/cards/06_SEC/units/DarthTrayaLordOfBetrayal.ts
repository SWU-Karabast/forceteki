import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class DarthTrayaLordOfBetrayal extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4195599545',
            internalName: 'darth-traya#lord-of-betrayal',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Ready a non-unit leader',
            optional: true,
            targetResolver: {
                cardTypeFilter: CardType.Leader,
                immediateEffect: abilityHelper.immediateEffects.ready(),
            }
        });
    }
}