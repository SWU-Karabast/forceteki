import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';


export default class _21BSurgicalDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5449704164',
            internalName: '21b-surgical-droid'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addOnAttackAbility({
            title: 'Heal 2 damage from another unit',
            optional: true,
            targetResolver: {
                cardCondition: (card, context) => card !== context.source,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 2 })
            }
        });
    }
}
