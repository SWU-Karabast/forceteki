import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class VolunteerSoldier extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4111616117',
            internalName: 'volunteer-soldier',
        };
    }

    public override setupCardAbilities() {
        this.addDecreaseCostAbility({
            title: 'If you control a Trooper unit, this unit costs 1 less to play',
            condition: (context) => context.player.getArenaUnits({ otherThan: context.source, trait: Trait.Trooper }).length > 0,
            amount: 1
        });
    }
}
