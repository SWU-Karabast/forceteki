import { BaseCard } from '../../../core/card/BaseCard';
import AbilityHelper from '../../../AbilityHelper';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class DroidManufactory extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '8589863038',
            internalName: 'droid-manufactory',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Create 2 Battle Droid tokens.',
            when: {
                onLeaderDeployed: (event, context) => event.card.controller === context.player
            },
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid({ amount: 2 }),
        });
    }
}

