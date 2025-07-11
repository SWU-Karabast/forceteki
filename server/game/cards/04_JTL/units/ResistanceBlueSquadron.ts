import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class ResistanceBlueSquadron extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5941636047',
            internalName: 'resistance-blue-squadron'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Deal damage to a unit equal to the number of friendly space units',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.player.getArenaUnits({ arena: ZoneName.SpaceArena }).length
                })),
            },
        });
    }
}
