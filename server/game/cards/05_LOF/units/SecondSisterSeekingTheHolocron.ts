import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, Trait } from '../../../core/Constants';

export default class SecondSisterSeekingTheHolocron extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'second-sister#seeking-the-holocron-id',
            internalName: 'second-sister#seeking-the-holocron',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Discard 2 cards from your deck. For each Force card discarded this way, ready a resource',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                    amount: 2,
                    target: context.player
                })),
                AbilityHelper.immediateEffects.readyResources((context) => ({
                    amount: context.events
                        .filter((event) => event.name === EventName.OnCardDiscarded)
                        .filter((event) => event.card.hasSomeTrait(Trait.Force)).length,
                    target: context.player
                }))
            ])
        });
    }
}