import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class IveGotABadFeeling extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'ive-got-a-bad-feeling-id',
            internalName: 'ive-got-a-bad-feeling',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Return a non-leader unit to its owner\'s hand and give a Shield token to a friendly unit',
            targetResolver: {
                activePromptTitle: 'Return a non-leader unit to its owner\'s hand',
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            then: {
                title: 'Give a Shield token to a friendly unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.giveShield()
                }
            }
        });
    }
}
