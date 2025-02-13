import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Aspect, EventName, RelativePlayer } from '../../../core/Constants';

export default class ForACauseIBelieveIn extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5767546527',
            internalName: 'for-a-cause-i-believe-in',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Reveal the top 4 cards of your deck',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.reveal((context) => ({
                    target: context.source.controller.getTopCardsOfDeck(4),
                    useDisplayPrompt: true,
                    promptedPlayer: RelativePlayer.Opponent
                })),
                AbilityHelper.immediateEffects.damage((context) => ({
                    target: context.source.controller.opponent.base,
                    amount: this.getHeroicCountFromRevealedCards(context.events)
                })),
                AbilityHelper.immediateEffects.conditional((context) => ({
                    condition: context.source.controller.opponent.base.remainingHp > 0,
                    onTrue: AbilityHelper.immediateEffects.lookAtAndChooseOption((context) => {
                        const topCardsOfDeck = context.source.controller.getTopCardsOfDeck(4);

                        return {
                            target: topCardsOfDeck,
                            perCardButtons: [
                                {
                                    text: 'Put on top',
                                    arg: 'top',
                                    immediateEffect: AbilityHelper.immediateEffects.moveToTopOfDeck({})
                                },
                                {
                                    text: 'Discard',
                                    arg: 'discard',
                                    immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard()
                                }
                            ]
                        };
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                }))
            ])
        });
    }

    private getHeroicCountFromRevealedCards(events: any[]): number {
        return events
            .filter((event) => event.name === EventName.OnCardRevealed)
            .flatMap((event) => event.cards)
            .reduce((acc, card) => {
                if (card.aspects.includes(Aspect.Heroism)) {
                    acc += 1;
                }
                return acc;
            }, 0);
    }
}