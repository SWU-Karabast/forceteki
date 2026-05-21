import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class OverchargedTransport extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3245865353',
            internalName: 'overcharged-transport',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Defeat an upgrade attached to a space unit',
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card) => card.isUpgrade() && card.parentCard.zoneName === ZoneName.SpaceArena,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}