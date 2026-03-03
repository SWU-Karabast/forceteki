import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, WildcardZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelpers';

export default class AdmiralMottiBrazenAndScornful extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9996676854',
            internalName: 'admiral-motti#brazen-and-scornful'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: TextHelper.performReplacements('Ready a Villainy unit'),
            optional: true,
            targetResolver: {
                zoneFilter: WildcardZoneName.AnyArena,
                cardCondition: (card) => card.isUnit() && card.aspects.includes(Aspect.Villainy),
                immediateEffect: AbilityHelper.immediateEffects.ready()
            }
        });
    }
}
