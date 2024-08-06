import { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import { Phases } from '../../../Constants';
import DrawCard from '../../../drawcard';

function cardsInPlay(context: AbilityContext, predicate: (card: DrawCard) => boolean) {
    return context.player.cardsInPlay
        .filter(predicate)
        .concat(context.player.opponent?.cardsInPlay.filter(predicate) ?? []);
}

export default class CripplingCurse extends DrawCard {
    static id = 'crippling-curse';

    setupCardAbilities() {
        this.forcedInterrupt({
            title: 'Discard fate and characters',
            when: {
                onPhaseStarted: (event, context) =>
                    event.phase === Phases.Fate &&
                    context.source.parent &&
                    !context.source.parent.bowed &&
                    context.source.parent.getFate() > 0
            },
            effect: 'discard all characters without fate and remove 1 fate from each character with fate',
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.discardFromPlay((context) => ({
                    target: cardsInPlay(context, (c) => c.getFate() === 0)
                })),
                AbilityDsl.actions.removeFate((context) => ({
                    target: cardsInPlay(context, (c) => c.getFate() !== 0)
                }))
            ])
        });
    }
}
