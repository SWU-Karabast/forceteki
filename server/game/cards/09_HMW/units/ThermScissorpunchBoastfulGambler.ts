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
            immediateEffect: AbilityHelper.immediateEffects.reveal((context) => {
                const ownTopCard = context.player.getTopCardOfDeck();
                const opponentTopCard = context.player.opponent.getTopCardOfDeck();
                const targets = [];
                const displayTextByCardUuid = new Map<string, string>();

                this.checkAddTopCard(ownTopCard, 'Yours', targets, displayTextByCardUuid);
                this.checkAddTopCard(opponentTopCard, 'Opponent\'s', targets, displayTextByCardUuid);

                return {
                    target: targets,
                    useDisplayPrompt: true,
                    displayTextByCardUuid,
                };
            }),
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

    private checkAddTopCard(card, title, targetsList, displayTextByCardUuid) {
        if (card != null) {
            targetsList.push(card);
            displayTextByCardUuid.set(card.uuid, title);
        }
    }
}
