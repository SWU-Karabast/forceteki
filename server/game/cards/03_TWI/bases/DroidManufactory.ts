import { BaseCard } from '../../../core/card/BaseCard';
import AbilityHelper from '../../../AbilityHelper';

export default class DroidManufactory extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '8589863038',
            internalName: 'droid-manufactory',
        };
    }

    public override setupCardAbilities () {
        this.addTriggeredAbility({
            title: 'Create 2 Battle Droid tokens.',
            when: {
                onLeaderDeployed: (event, context) => event.card.controller === context.source.controller
            },
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid({ amount: 2 }),
        });
    }
}

