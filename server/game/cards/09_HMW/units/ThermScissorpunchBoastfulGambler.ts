import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, PhaseName } from '../../../core/Constants';

export default class ThermScissorpunchBoastfulGambler extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'therm-scissorpunch#boastful-gambler-id',
            internalName: 'therm-scissorpunch#boastful-gambler',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Reveal the top card of your deck and an opponent\'s deck',
            when: {
                onPhaseStarted: (event) => event.phase === PhaseName.Action
            },
            immediateEffect: AbilityHelper.immediateEffects.reveal((context) => ({
                useDisplayPrompt: true,
                target: [
                    context.player.getTopCardOfDeck(),
                    context.player.opponent.getTopCardOfDeck()
                ].filter(Boolean), // Remove any null or undefined cards from the target array
            })),
            then: (thenContext) => ({
                title: 'This unit gets -2/-2 for this phase for each revealed card that costs 3 or more',
                thenCondition: () => this.qualifyingRevealedCardCount(thenContext.events) > 0,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => {
                    const count = this.qualifyingRevealedCardCount(thenContext.events);
                    return {
                        target: context.source,
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2 * count, hp: -2 * count })
                    };
                })
            })
        });
    }

    private qualifyingRevealedCardCount(events): number {
        return events
            .filter((event) => event.name === EventName.OnCardRevealed)
            .flatMap((event) => event.card ?? [])
            .filter((card) => card.cost >= 3).length;
    }
}
