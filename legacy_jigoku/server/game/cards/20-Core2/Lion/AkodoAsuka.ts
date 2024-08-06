import type { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import { Locations } from '../../../Constants';
import DrawCard from '../../../drawcard';

function getCharactersWithoutFate(context: AbilityContext) {
    return context.game.currentConflict?.getNumberOfParticipantsFor(context.player) ?? 0;
}

export default class AkodoAsuka extends DrawCard {
    static id = 'akodo-asuka';

    setupCardAbilities() {
        this.reaction({
            title: 'Draw a card',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.source.controller &&
                    context.source.isParticipating() &&
                    context.player.conflictDeck.size() > 0
            },
            gameAction: AbilityDsl.actions.deckSearch({
                amount: (context) => getCharactersWithoutFate(context),
                activePromptTitle: 'Choose a card to put in your hand',
                gameAction: AbilityDsl.actions.moveCard({
                    destination: Locations.Hand
                }),
                shuffle: false,
                reveal: false,
                placeOnBottomInRandomOrder: true
            }),
            effect: 'look at the top {1} cards of their conflict deck',
            effectArgs: (context) => getCharactersWithoutFate(context)
        });
    }
}
