import { CardTypes } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class MantraOfAir extends DrawCard {
    static id = 'mantra-of-air';

    setupCardAbilities() {
        this.reaction({
            title: 'Honor a monk and draw a card',
            when: {
                onConflictDeclared: (event, context) =>
                    event.ring.hasElement('air') && event.conflict.attackingPlayer === context.player.opponent
            },
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) =>
                    card.hasTrait('monk') || card.attachments.some((card) => card.hasTrait('monk')),
                gameAction: AbilityDsl.actions.honor()
            },
            effect: 'honor {0} and draw a card',
            gameAction: AbilityDsl.actions.draw()
        });
    }
}
