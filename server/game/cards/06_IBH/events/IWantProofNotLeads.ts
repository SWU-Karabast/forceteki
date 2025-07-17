import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class IWantProofNotLeads extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2796502553',
            internalName: 'i-want-proof-not-leads',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Draw 2 cards, then discard a card from your hand.',
            immediateEffect: AbilityHelper.immediateEffects.draw({ amount: 2 }),
            then: {
                title: 'Discard a card from your hand',
                immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                    cardTypeFilter: WildcardCardType.Any,
                    target: context.player,
                    amount: 1
                })),
            }
        });
    }
}

