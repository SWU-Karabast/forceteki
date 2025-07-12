import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class VictorLeaderLeadingFromTheFront extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9811031405',
            internalName: 'victor-leader#leading-from-the-front',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'Each other friendly space unit gets +1/+1',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Unit,
            targetZoneFilter: ZoneName.SpaceArena,
            matchTarget: (card, context) => card !== context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 })
        });
    }
}
