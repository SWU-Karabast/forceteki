import AbilityHelper from '../../../AbilityHelper';
import { BaseCard } from '../../../core/card/BaseCard';

export default class MysticMonastery extends BaseCard {
    protected override getImplementationId () {
        return {
            id: 'mystic-monastery-id',
            internalName: 'mystic-monastery',
        };
    }

    public override setupCardAbilities () {
        this.addActionAbility({
            title: 'The Force is with you',
            limit: AbilityHelper.limit.perGame(3),
            immediateEffect: AbilityHelper.immediateEffects.theForceIsWithYou()
        });
    }
}
