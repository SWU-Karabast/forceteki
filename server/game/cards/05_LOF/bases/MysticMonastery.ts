import AbilityHelper from '../../../AbilityHelper';
import { BaseCard } from '../../../core/card/BaseCard';

export default class MysticMonastery extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '9434212852',
            internalName: 'mystic-monastery',
        };
    }

    public override setupCardAbilities () {
        const limit = AbilityHelper.limit.perGame(3);

        this.addActionAbility({
            title: 'The Force is with you',
            limit: limit,
            effect: 'gain the Force ({1} uses left).',
            effectArgs(context) {
                const currentUses = limit.currentForPlayer(context.player);
                const usesLeft = limit.max - currentUses;
                return [usesLeft];
            },
            immediateEffect: AbilityHelper.immediateEffects.theForceIsWithYou()
        });
    }
}
