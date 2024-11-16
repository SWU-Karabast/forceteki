import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class CartelTurncoat extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9108611319',
            internalName: 'cartel-turncoat',
        };
    }

    public override setupCardAbilities() {
        this.addBountyAbility({
            title: 'Draw a card',
            immediateEffect: AbilityHelper.immediateEffects.draw()
        });
    }
}

CartelTurncoat.implemented = true;
