import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, ZoneName } from '../../../core/Constants';

export default class BountyHunterCrew extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3684950815',
            internalName: 'bounty-hunter-crew'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Return an event from a discard pile',
            optional: true,
            targetResolver: {
                cardTypeFilter: CardType.Event,
                zoneFilter: ZoneName.Discard,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}
