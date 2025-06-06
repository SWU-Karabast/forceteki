import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, Trait } from '../../../core/Constants';

export default class SecondSisterSeekingTheHolocron extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9288795472',
            internalName: 'second-sister#seeking-the-holocron',
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
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