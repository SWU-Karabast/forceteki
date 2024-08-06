import { Locations, Players, TargetModes } from '../../Constants';
import AbilityDsl = require('../../abilitydsl');
import type BaseCard = require('../../basecard');
import DrawCard = require('../../drawcard');

export default class InquisiorialInitiate extends DrawCard {
    static id = 'inquisitorial-initiate';

    public setupCardAbilities() {
        this.reaction({
            title: "Discard an opponent's card",
            when: {
                afterConflict: (event, context) =>
                    context.source.isParticipating() &&
                    event.conflict.winner === context.source.controller &&
                    context.player.opponent !== undefined
            },
            target: {
                activePromptTitle: 'Choose cards to reveal',
                player: Players.Opponent,
                numCardsFunc: (context) =>
                    context.player.opponent.cardsInPlay.filter((card: BaseCard) => card.getFate() === 0).length,
                mode: TargetModes.ExactlyVariable,
                location: Locations.Hand
            },
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.lookAt((context) => ({
                    target: context.target
                })),
                AbilityDsl.actions.cardMenu((context) => ({
                    cards: context.target,
                    gameAction: AbilityDsl.actions.discardCard(),
                    message: '{0} chooses {1} to be discarded',
                    messageArgs: (card, player) => [player, card]
                }))
            ])
        });
    }
}
