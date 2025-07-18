import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class MaKlounkee extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0931441928',
            internalName: 'ma-klounkee',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Return a friendly non-leader Underworld unit to its owner\'s hand. If you do, deal 3 damage to a unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.hasSomeTrait(Trait.Underworld),
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            ifYouDo: {
                title: 'Deal 3 damage to a unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
                }
            }
        });
    }
}
