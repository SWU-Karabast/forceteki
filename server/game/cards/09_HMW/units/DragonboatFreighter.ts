import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';

export default class DragonboatFreighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'dragonboat-freighter-id',
            internalName: 'dragonboat-freighter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give a Weakness token to a unit. If it\'s a unique unit, exhaust it',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.giveWeakness(),
                    AbilityHelper.immediateEffects.conditional({
                        condition: (context) => context.target.unique,
                        onTrue: AbilityHelper.immediateEffects.exhaust()
                    })
                ])
            }
        });
    }
}
