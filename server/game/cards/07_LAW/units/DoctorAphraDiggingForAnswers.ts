import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventName, RelativePlayer, Trait, ZoneName } from '../../../core/Constants';

export default class DoctorAphraDiggingForAnswers extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'doctor-aphra#digging-for-answers-id',
            internalName: 'doctor-aphra#digging-for-answers',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Discard the top 3 cards of your deck. You may return an Underworld card discarded this way to your hand',
            immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 3,
                target: context.player
            })),
            then: (thenContext) => {
                const discardedUnderworldCards = thenContext.events
                    .filter((event) => event.name === EventName.OnCardDiscarded)
                    .map((event) => event.card)
                    .filter((card) => card.hasSomeTrait(Trait.Underworld));

                return {
                    title: 'Return a discarded Underworld card to your hand',
                    optional: true,
                    targetResolver: {
                        controller: RelativePlayer.Self,
                        zoneFilter: ZoneName.Discard,
                        cardCondition: (card) => discardedUnderworldCards.includes(card),
                        immediateEffect: AbilityHelper.immediateEffects.returnToHand()
                    }
                };
            }
        });
    }
}
