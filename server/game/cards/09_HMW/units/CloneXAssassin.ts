import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';

export default class CloneXAssassin extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'clone-x-assassin-id',
            internalName: 'clone-x-assassin',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Give a Weakness token to a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.giveWeakness()
            }
        });
    }
}