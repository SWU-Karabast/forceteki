import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class JediStarfighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3363314608',
            internalName: 'jedi-starfighter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal 1 damage to a space unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.SpaceArena,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}
