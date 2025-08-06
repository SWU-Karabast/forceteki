import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class GentleGiant extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8190373087',
            internalName: 'gentle-giant'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Heal damage from another unit equal to the damage on this unit',
            optional: true,
            targetResolver: {
                cardCondition: (card, context) => card !== context.source,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.heal((context) => ({ amount: context.source.damage }))
            }
        });
    }
}
