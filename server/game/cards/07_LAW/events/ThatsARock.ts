import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class ThatsARock extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'thats-a-rock-id',
            internalName: 'thats-a-rock',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 1 damage to a unit.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });

        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to a unit.',
            optional: true,
            when: {
                onCardDiscarded: (event, context) => event.card === context.source && (event.discardedFromZone === ZoneName.Hand || event.discardedFromZone === ZoneName.Deck),
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }

        });
    }
}
