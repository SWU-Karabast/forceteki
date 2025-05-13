import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class NightsisterWarrior extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'nightsister-warrior-id',
            internalName: 'nightsister-warrior',
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Draw a card',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.draw()
        });
    }
}