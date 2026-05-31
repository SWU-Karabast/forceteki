import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class FollowMe extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4388494523',
            internalName: 'follow-me',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. After completing the attack, give 3 Advantage tokens to a unit',
            initiateAttack: {},
            then: {
                title: 'Give 3 Advantage tokens to a unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.giveAdvantage({ amount: 3 })
                }
            }
        });
    }
}
