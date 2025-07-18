import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class SystemShock extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2454329668',
            internalName: 'system-shock',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat a non-leader upgrade attached to a unit. If you do, deal 1 damage to that unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUpgrade,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal 1 damage to that unit',
                immediateEffect: AbilityHelper.immediateEffects.damage({
                    amount: 1,
                    target: ifYouDoContext.events[0]?.lastKnownInformation?.parentCard
                })
            })
        });
    }
}
