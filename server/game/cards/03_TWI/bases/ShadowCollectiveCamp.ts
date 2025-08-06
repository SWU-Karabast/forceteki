import { BaseCard } from '../../../core/card/BaseCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class ShadowCollectiveCamp extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '6854189262',
            internalName: 'shadow-collective-camp',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Draw a card.',
            when: {
                onLeaderDeployed: (event, context) => event.card.controller === context.player
            },
            immediateEffect: AbilityHelper.immediateEffects.draw()
        });
    }
}
