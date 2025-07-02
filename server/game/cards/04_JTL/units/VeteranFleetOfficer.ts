import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class VeteranFleetOfficer extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9347873117',
            internalName: 'veteran-fleet-officer',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'Create an X-Wing token',
            immediateEffect: AbilityHelper.immediateEffects.createXWing()
        });
    }
}