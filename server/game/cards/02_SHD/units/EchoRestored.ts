import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class EchoRestored extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3671559022',
            internalName: 'echo#restored',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Discard a card from your hand. Give 2 Experience tokens to a unit in play with the same name as the discarded card.',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                cardTypeFilter: WildcardCardType.Any,
                target: context.player,
                amount: 1
            })),
            ifYouDo: (context) => ({
                title: 'Give 2 Experience tokens to a unit in play with the same name as the discarded card',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.title === context.events[0].card.title,
                    immediateEffect: AbilityHelper.immediateEffects.giveExperience({ amount: 2 })
                }
            })
        });
    }
}
