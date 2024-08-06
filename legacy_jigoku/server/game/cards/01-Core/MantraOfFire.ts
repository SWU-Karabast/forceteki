import { CardTypes } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class MantraOfFire extends DrawCard {
    static id = 'mantra-of-fire';

    setupCardAbilities() {
        this.reaction({
            title: 'Add 1 fate to a monk and draw a card',
            when: {
                onConflictDeclared: (event, context) =>
                    event.ring.hasElement('fire') && event.conflict.attackingPlayer === context.player.opponent
            },
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) =>
                    card.hasTrait('monk') || card.attachments.some((card) => card.hasTrait('monk')),
                gameAction: AbilityDsl.actions.placeFate()
            },
            effect: 'add a fate to {0} and draw a card',
            gameAction: AbilityDsl.actions.draw()
        });
    }
}
