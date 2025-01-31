import { BaseCard } from '../../../core/card/BaseCard';
import AbilityHelper from '../../../AbilityHelper';

export default class ShadowCollectiveCamp extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '6854189262',
            internalName: 'shadow-collective-camp',
        };
    }

    public override setupCardAbilities () {
        this.addTriggeredAbility({
            title: 'When you deploy a leader: Draw a card.',
            when: {
                onLeaderDeployed: (event, context) => event.card.controller === context.source.controller
            },
            immediateEffect: AbilityHelper.immediateEffects.draw()
        });
    }
}
