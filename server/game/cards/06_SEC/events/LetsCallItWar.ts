import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class LetsCallItWar extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8330828981',
            internalName: 'lets-call-it-war',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 3 damage to a unit',
            optional: false,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
            },
            then: (thenContext) => ({
                title: 'Deal 2 damage to another unit in the same arena',
                thenCondition: () => thenContext.player.hasInitiative(),
                optional: true,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, _) => card !== thenContext.target && card.zoneName === thenContext.target.zoneName,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                }
            })
        });
    }
}