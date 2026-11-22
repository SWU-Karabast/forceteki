import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class WildSpaceWanderer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7403509677',
            internalName: 'wild-space-wanderer'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat an upgrade on a base',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card) => card.isUpgrade() && card.parentCard.isBase(),
                immediateEffect: abilityHelper.immediateEffects.defeat()
            }
        });
    }
}
