import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class OccupationOfficer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8778272573',
            internalName: 'occupation-officer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give a Weakness token to a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.resources.length >= 6,
                    onTrue: AbilityHelper.immediateEffects.giveWeakness()
                })
            }
        });
    }
}