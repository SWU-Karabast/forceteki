import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class LothCat extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2755329102',
            internalName: 'lothcat',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Exhaust a ground unit',
            optional: true,
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            }
        });
    }
}