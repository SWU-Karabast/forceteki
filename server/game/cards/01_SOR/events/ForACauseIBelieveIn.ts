import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Aspect } from '../../../core/Constants';

export default class ForACauseIBelieveIn extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5767546527',
            internalName: 'for-a-cause-i-believe-in',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Reveal the top 4 cards of your deck',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous((context) => {
                const topCardsOfDeck = context.player.getTopCardsOfDeck(4);
                const heroicCount = this.getHeroicCountFromCards(topCardsOfDeck);
                const opponentBaseRemainingHp = context.player.opponent.base.remainingHp;

                // Do a simple chat reveal if this will deal lethal damage
                const revealEffect = (heroicCount >= opponentBaseRemainingHp)
                    ? AbilityHelper.immediateEffects.reveal({
                        target: topCardsOfDeck,
                    })
                    : AbilityHelper.immediateEffects.revealAndChooseOption({
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
                    });

                return [
                    revealEffect,
                    AbilityHelper.immediateEffects.damage({
                        target: context.player.opponent.base,
                        amount: heroicCount
                    })
                ];
            }),
        });
    }

    private getHeroicCountFromCards(cards: Card[]): number {
        return cards
            .reduce((acc, card) => {
                if (card.aspects.includes(Aspect.Heroism)) {
                    acc += 1;
                }
                return acc;
            }, 0);
    }
}