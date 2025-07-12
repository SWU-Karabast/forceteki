import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType, RelativePlayer } from '../../../core/Constants';

export default class UnleashRage extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8421586325',
            internalName: 'unleash-rage',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Use the Force to give a friendly unit +3/+0',
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'give a friendly unit +3/+0',
                targetResolver: {
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 0 }),
                    }),
                },
            }
        });
    }
}