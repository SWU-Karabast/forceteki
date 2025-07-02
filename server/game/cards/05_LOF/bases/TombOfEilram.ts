import AbilityHelper from '../../../AbilityHelper';
import { BaseCard } from '../../../core/card/BaseCard';

export default class TombOfEilram extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '2699176260',
            internalName: 'tomb-of-eilram',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addActionAbility({
            title: 'The Force is with you',
            cost: AbilityHelper.costs.exhaustFriendlyUnit(),
            immediateEffect: AbilityHelper.immediateEffects.theForceIsWithYou()
        });
    }
}
