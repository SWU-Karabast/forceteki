import { CardTypes, DuelTypes, Players } from '../../Constants';
import type { Duel } from '../../Duel';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class PolicyDebate extends DrawCard {
    static id = 'policy-debate';

    setupCardAbilities() {
        this.action({
            title: 'Initiate a political duel',
            targets: {
                challenger: {
                    cardType: CardTypes.Character,
                    controller: Players.Self,
                    cardCondition: (card) => card.isParticipating()
                },
                duelTarget: {
                    dependsOn: 'challenger',
                    cardType: CardTypes.Character,
                    controller: Players.Opponent,
                    cardCondition: (card) => card.isParticipating(),
                    gameAction: AbilityDsl.actions.duel((context) => ({
                        type: DuelTypes.Political,
                        challenger: context.targets.challenger,
                        message: "{0} sees {1}'s hand and chooses a card to discard",
                        messageArgs: (duel) => [duel.loserController.opponent, duel.loserController],
                        gameAction: (duel) =>
                            AbilityDsl.actions.sequential([
                                AbilityDsl.actions.lookAt({
                                    target: this.#losersHand(duel),
                                    message: '{0} reveals their hand: {1}',
                                    messageArgs: (cards) => [duel.loserController, cards]
                                }),
                                AbilityDsl.actions.cardMenu({
                                    activePromptTitle: 'Choose card to discard',
                                    player: duel.loserController === context.player ? Players.Opponent : Players.Self,
                                    cards: this.#losersHand(duel),
                                    targets: true,
                                    message: '{0} chooses {1} to be discarded',
                                    messageArgs: (card) => [duel.loserController.opponent, card],
                                    gameAction: AbilityDsl.actions.discardCard()
                                })
                            ])
                    }))
                }
            }
        });
    }

    #losersHand(duel: Duel): DrawCard[] {
        return duel.loserController?.hand.sortBy((card: DrawCard) => card.name) ?? [];
    }
}
