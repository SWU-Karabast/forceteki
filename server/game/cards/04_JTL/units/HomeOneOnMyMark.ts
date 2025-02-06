import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class HomeOneOnMyMark extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1356826899',
            internalName: 'home-one#on-my-mark',
        };
    }

    public override setupCardAbilities() {
        this.addDecreaseCostAbility({
            title: 'This units costs 3 resources less to play',
            condition: (context) => context.source.controller.opponent.getUnitsInPlay(ZoneName.SpaceArena).length >= 3,
            amount: 3
        });
    }
}
